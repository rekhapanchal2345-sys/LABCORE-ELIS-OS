"use client";

/* =======================================================
   WEBAUTHN (FINGERPRINT/BIOMETRIC) AUTHENTICATION
======================================================= */

export interface WebAuthnCredential {
  id: string;
  rawId: string;
  type: string;
  response: {
    clientDataJSON: string;
    authenticatorData: string;
    signature: string;
    userHandle?: string;
  };
}

export interface WebAuthnOptions {
  challenge: string;
  rpId: string;
  allowCredentials?: Array<{
    id: string;
    type: string;
    transports?: string[];
  }>;
  userVerification?: "required" | "preferred" | "discouraged";
  timeout?: number;
}

export interface WebAuthnRegistrationOptions {
  challenge: string;
  rp: {
    name: string;
    id: string;
  };
  user: {
    id: string;
    name: string;
    displayName: string;
  };
  pubKeyCredParams: Array<{
    type: "public-key";
    alg: number;
  }>;
  authenticatorSelection?: {
    authenticatorAttachment?: "platform" | "cross-platform";
    userVerification?: "required" | "preferred" | "discouraged";
  };
  timeout?: number;
}

/* =======================================================
   BROWSER SUPPORT CHECK
======================================================= */

export function isWebAuthnSupported(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    "credentials" in navigator &&
    "PublicKeyCredential" in window &&
    "navigator" in window &&
    (navigator as any).credentials !== undefined
  );
}

export function isBiometricAvailable(): boolean {
  if (!isWebAuthnSupported()) {
    return false;
  }

  // Check if platform authenticator is available (fingerprint, face ID, etc.)
  return PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable !== undefined;
}

export async function checkBiometricSupport(): Promise<boolean> {
  if (!isWebAuthnSupported()) {
    return false;
  }

  try {
    if (PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) {
      return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    }
    return false;
  } catch {
    return false;
  }
}

/* =======================================================
   WEBAUTHN REGISTRATION (CREDENTIAL CREATION)
======================================================= */

export async function registerCredential(
  options: WebAuthnRegistrationOptions
): Promise<WebAuthnCredential> {
  if (!isWebAuthnSupported()) {
    throw new Error("WebAuthn is not supported in this browser");
  }

  try {
    const credential = (await navigator.credentials.create({
      publicKey: {
        challenge: base64ToArrayBuffer(options.challenge),
        rp: options.rp,
        user: {
          id: base64ToArrayBuffer(options.user.id),
          name: options.user.name,
          displayName: options.user.displayName,
        },
        pubKeyCredParams: options.pubKeyCredParams,
        authenticatorSelection: options.authenticatorSelection,
        timeout: options.timeout || 60000,
      },
    })) as PublicKeyCredential;

    if (!credential) {
      throw new Error("Credential creation failed");
    }

    const response = credential.response as AuthenticatorAttestationResponse;

    return {
      id: credential.id,
      rawId: arrayBufferToBase64(credential.rawId),
      type: credential.type,
      response: {
        clientDataJSON: arrayBufferToBase64(response.clientDataJSON),
        authenticatorData: arrayBufferToBase64(response.authenticatorData),
        signature: arrayBufferToBase64(response.signature),
      },
    };
  } catch (error) {
    throw new Error(
      `Biometric registration failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/* =======================================================
   WEBAUTHN AUTHENTICATION (CREDENTIAL ASSERTION)
======================================================= */

export async function authenticateWithCredential(
  options: WebAuthnOptions
): Promise<WebAuthnCredential> {
  if (!isWebAuthnSupported()) {
    throw new Error("WebAuthn is not supported in this browser");
  }

  try {
    const credential = (await navigator.credentials.get({
      publicKey: {
        challenge: base64ToArrayBuffer(options.challenge),
        rpId: options.rpId,
        allowCredentials: options.allowCredentials?.map(cred => ({
          id: base64ToArrayBuffer(cred.id),
          type: cred.type as PublicKeyCredentialType,
          transports: cred.transports as AuthenticatorTransportFuture[],
        })),
        userVerification: options.userVerification || "preferred",
        timeout: options.timeout || 60000,
      },
    })) as PublicKeyCredential;

    if (!credential) {
      throw new Error("Authentication failed");
    }

    const response = credential.response as AuthenticatorAssertionResponse;

    return {
      id: credential.id,
      rawId: arrayBufferToBase64(credential.rawId),
      type: credential.type,
      response: {
        clientDataJSON: arrayBufferToBase64(response.clientDataJSON),
        authenticatorData: arrayBufferToBase64(response.authenticatorData),
        signature: arrayBufferToBase64(response.signature),
        userHandle: response.userHandle ? arrayBufferToBase64(response.userHandle) : undefined,
      },
    };
  } catch (error) {
    throw new Error(
      `Biometric authentication failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/* =======================================================
   UTILITY FUNCTIONS
======================================================= */

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const bytes = atob(base64);
  const buffer = new ArrayBuffer(bytes.length);
  const view = new Uint8Array(buffer);
  
  for (let i = 0; i < bytes.length; i++) {
    view[i] = bytes.charCodeAt(i);
  }
  
  return buffer;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  
  return btoa(binary);
}

/* =======================================================
   CONVENIENCE FUNCTIONS
======================================================= */

export async function startBiometricRegistration(
  userEmail: string,
  userName: string,
  challenge: string,
  rpId: string = window.location.hostname
): Promise<WebAuthnCredential> {
  const options: WebAuthnRegistrationOptions = {
    challenge,
    rp: {
      name: "LabCore ELIS",
      id: rpId,
    },
    user: {
      id: btoa(userEmail),
      name: userEmail,
      displayName: userName,
    },
    pubKeyCredParams: [
      { type: "public-key", alg: -7 }, // ES256
      { type: "public-key", alg: -257 }, // RS256
    ],
    authenticatorSelection: {
      authenticatorAttachment: "platform",
      userVerification: "required",
    },
    timeout: 60000,
  };

  return registerCredential(options);
}

export async function startBiometricAuthentication(
  challenge: string,
  rpId: string = window.location.hostname,
  credentialIds?: string[]
): Promise<WebAuthnCredential> {
  const options: WebAuthnOptions = {
    challenge,
    rpId,
    allowCredentials: credentialIds?.map(id => ({
      id,
      type: "public-key",
      transports: ["internal", "hybrid"],
    })),
    userVerification: "required",
    timeout: 60000,
  };

  return authenticateWithCredential(options);
}