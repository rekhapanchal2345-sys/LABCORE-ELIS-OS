/* =======================================================
   WEBAUTHN TYPE DEFINITIONS
======================================================= */

interface CredentialRequestOptions {
  publicKey?: PublicKeyCredentialRequestOptions;
}

interface CredentialCreationOptions {
  publicKey?: PublicKeyCredentialCreationOptions;
}

interface PublicKeyCredentialRequestOptions {
  challenge: ArrayBuffer;
  rpId?: string;
  allowCredentials?: Array<{
    id: ArrayBuffer;
    type: PublicKeyCredentialType;
    transports?: AuthenticatorTransportFuture[];
  }>;
  userVerification?: UserVerificationRequirement;
  timeout?: number;
}

interface PublicKeyCredentialCreationOptions {
  challenge: ArrayBuffer;
  rp: {
    name: string;
    id?: string;
  };
  user: {
    id: ArrayBuffer;
    name: string;
    displayName: string;
  };
  pubKeyCredParams: Array<{
    type: "public-key";
    alg: number;
  }>;
  authenticatorSelection?: AuthenticatorSelectionCriteria;
  timeout?: number;
}

interface AuthenticatorSelectionCriteria {
  authenticatorAttachment?: AuthenticatorAttachment;
  userVerification?: UserVerificationRequirement;
  requireResidentKey?: boolean;
}

type AuthenticatorAttachment = "platform" | "cross-platform";
type UserVerificationRequirement = "required" | "preferred" | "discouraged";
type PublicKeyCredentialType = "public-key";
type AuthenticatorTransportFuture = "ble" | "internal" | "nfc" | "usb" | "hybrid";

interface AuthenticatorAttestationResponse {
  clientDataJSON: ArrayBuffer;
  authenticatorData: ArrayBuffer;
  signature: ArrayBuffer;
}

interface AuthenticatorAssertionResponse {
  clientDataJSON: ArrayBuffer;
  authenticatorData: ArrayBuffer;
  signature: ArrayBuffer;
  userHandle?: ArrayBuffer;
}

interface PublicKeyCredential extends Credential {
  id: string;
  rawId: ArrayBuffer;
  type: PublicKeyCredentialType;
  response: AuthenticatorAttestationResponse | AuthenticatorAssertionResponse;
  getClientExtensionResults(): any;
}

interface Credential {
  id: string;
  type: string;
}

interface PublicKeyCredential {
  isUserVerifyingPlatformAuthenticatorAvailable?(): Promise<boolean>;
  isConditionalMediationAvailable?(): Promise<boolean>;
}