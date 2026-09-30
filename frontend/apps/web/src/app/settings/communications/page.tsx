"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/dashboardlayout";
import { laboratorySettingsApi } from "@/lib/api";

export default function CommunicationSettingsPage() {
  const [activeTab, setActiveTab] = useState<'call' | 'email' | 'sms' | 'whatsapp' | 'general'>('general');
  const [settings, setSettings] = useState<any>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await laboratorySettingsApi.getSettings();
      setSettings(response.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleSaveSettings = async () => {
    setSaveStatus('saving');
    try {
      await laboratorySettingsApi.updateSettings(settings);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  const updateSetting = (field: string, value: any) => {
    setSettings({ ...settings, [field]: value });
  };

  if (!settings) {
    return (
      <DashboardLayout title="Communication Settings">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading settings...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Communication Settings">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Communication Settings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Configure laboratory contact details and communication provider integrations
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex gap-8">
            {[
              { id: 'general', label: 'General', icon: '⚙️' },
              { id: 'email', label: 'Email Integration', icon: '✉️' },
              { id: 'sms', label: 'SMS Integration', icon: '💬' },
              { id: 'whatsapp', label: 'WhatsApp Integration', icon: '📱' },
              { id: 'call', label: 'Call Integration', icon: '📞' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">⚙️ Laboratory Contact Information</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Laboratory Name</label>
                <input
                  type="text"
                  value={settings.labName || ''}
                  onChange={(e) => updateSetting('labName', e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={settings.labPhone || ''}
                  onChange={(e) => updateSetting('labPhone', e.target.value)}
                  placeholder="9723561529"
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={settings.labEmail || ''}
                  onChange={(e) => updateSetting('labEmail', e.target.value)}
                  placeholder="nikilpanchal5@gmail.com"
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  value={settings.labAddress || ''}
                  onChange={(e) => updateSetting('labAddress', e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    value={settings.labCity || ''}
                    onChange={(e) => updateSetting('labCity', e.target.value)}
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    value={settings.labState || ''}
                    onChange={(e) => updateSetting('labState', e.target.value)}
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                <input
                  type="text"
                  value={settings.labPincode || ''}
                  onChange={(e) => updateSetting('labPincode', e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                />
              </div>

              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={handleSaveSettings}
                  disabled={saveStatus === 'saving'}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 text-sm"
                >
                  {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? '✓ Saved' : 'Save Settings'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Email Configuration */}
        {activeTab === 'email' && (
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">✉️ Email Integration Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
                <select
                  value={settings.emailProvider || 'custom'}
                  onChange={(e) => updateSetting('emailProvider', e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="custom">Not Configured</option>
                  <option value="sendgrid">SendGrid</option>
                  <option value="mailgun">Mailgun</option>
                  <option value="ses">AWS SES</option>
                  <option value="smtp">Custom SMTP</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Email</label>
                <input
                  type="email"
                  value={settings.emailFromEmail || ''}
                  onChange={(e) => updateSetting('emailFromEmail', e.target.value)}
                  placeholder="noreply@labcore.com"
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Name</label>
                <input
                  type="text"
                  value={settings.emailFromName || ''}
                  onChange={(e) => updateSetting('emailFromName', e.target.value)}
                  placeholder="LabCore Enterprise LIS"
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                />
              </div>

              {settings.emailProvider && settings.emailProvider !== 'custom' && settings.emailProvider !== 'smtp' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                  <input
                    type="password"
                    value={settings.emailApiKey || ''}
                    onChange={(e) => updateSetting('emailApiKey', e.target.value)}
                    placeholder="Enter your API key"
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>
              )}

              {settings.emailProvider === 'smtp' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Host</label>
                    <input
                      type="text"
                      value={settings.smtpHost || ''}
                      onChange={(e) => updateSetting('smtpHost', e.target.value)}
                      placeholder="smtp.gmail.com"
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Port</label>
                    <input
                      type="number"
                      value={settings.smtpPort || 587}
                      onChange={(e) => updateSetting('smtpPort', parseInt(e.target.value))}
                      placeholder="587"
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">SMTP User</label>
                    <input
                      type="text"
                      value={settings.smtpUser || ''}
                      onChange={(e) => updateSetting('smtpUser', e.target.value)}
                      placeholder="SMTP username"
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Password</label>
                    <input
                      type="password"
                      value={settings.smtpPassword || ''}
                      onChange={(e) => updateSetting('smtpPassword', e.target.value)}
                      placeholder="SMTP password"
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>
                </>
              )}

              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={handleSaveSettings}
                  disabled={saveStatus === 'saving'}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 text-sm"
                >
                  {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? '✓ Saved' : 'Save Configuration'}
                </button>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Setup Instructions</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• <strong>Not Configured:</strong> Email features will be disabled</li>
                <li>• <strong>SendGrid:</strong> Get API key from sendgrid.com/settings/api_keys</li>
                <li>• <strong>Mailgun:</strong> Get API key from app.mailgun.com/settings/api_security</li>
                <li>• <strong>AWS SES:</strong> Configure AWS credentials and verify sender email</li>
                <li>• <strong>SMTP:</strong> Use your own or organization's SMTP server</li>
              </ul>
            </div>
          </div>
        )}

        {/* SMS Configuration */}
        {activeTab === 'sms' && (
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">💬 SMS Integration Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
                <select
                  value={settings.smsProvider || 'custom'}
                  onChange={(e) => updateSetting('smsProvider', e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="custom">Not Configured</option>
                  <option value="twilio">Twilio</option>
                  <option value="plivo">Plivo</option>
                  <option value="nexmo">Nexmo (Vonage)</option>
                </select>
              </div>

              {settings.smsProvider && settings.smsProvider !== 'custom' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                    <input
                      type="text"
                      value={settings.smsApiKey || ''}
                      onChange={(e) => updateSetting('smsApiKey', e.target.value)}
                      placeholder="Enter your API key"
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">API Secret</label>
                    <input
                      type="password"
                      value={settings.smsApiSecret || ''}
                      onChange={(e) => updateSetting('smsApiSecret', e.target.value)}
                      placeholder="Enter your API secret"
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sender ID</label>
                    <input
                      type="text"
                      value={settings.smsSenderId || ''}
                      onChange={(e) => updateSetting('smsSenderId', e.target.value)}
                      placeholder="LABCORE or your phone number"
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>
                </>
              )}

              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={handleSaveSettings}
                  disabled={saveStatus === 'saving'}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 text-sm"
                >
                  {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? '✓ Saved' : 'Save Configuration'}
                </button>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Setup Instructions</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• <strong>Not Configured:</strong> SMS features will be disabled</li>
                <li>• <strong>Twilio:</strong> Get API keys from twilio.com/console</li>
                <li>• <strong>Plivo:</strong> Get credentials from plivo.com/dashboard</li>
                <li>• <strong>Nexmo:</strong> Get API key from vonage.com</li>
              </ul>
            </div>
          </div>
        )}

        {/* WhatsApp Configuration */}
        {activeTab === 'whatsapp' && (
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📱 WhatsApp Integration Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
                <select
                  value={settings.whatsappProvider || 'custom'}
                  onChange={(e) => updateSetting('whatsappProvider', e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="custom">Not Configured</option>
                  <option value="meta">Meta Cloud API</option>
                  <option value="twilio">Twilio</option>
                </select>
              </div>

              {settings.whatsappProvider && settings.whatsappProvider !== 'custom' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number ID</label>
                    <input
                      type="text"
                      value={settings.whatsappPhoneNumberId || ''}
                      onChange={(e) => updateSetting('whatsappPhoneNumberId', e.target.value)}
                      placeholder="Enter your WhatsApp Phone Number ID"
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Access Token</label>
                    <input
                      type="password"
                      value={settings.whatsappAccessToken || ''}
                      onChange={(e) => updateSetting('whatsappAccessToken', e.target.value)}
                      placeholder="Enter your WhatsApp Access Token"
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Webhook URL</label>
                    <input
                      type="text"
                      value={settings.whatsappWebhookUrl || ''}
                      onChange={(e) => updateSetting('whatsappWebhookUrl', e.target.value)}
                      placeholder="https://your-domain.com/api/whatsapp/webhook"
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Verify Token</label>
                    <input
                      type="text"
                      value={settings.whatsappVerifyToken || ''}
                      onChange={(e) => updateSetting('whatsappVerifyToken', e.target.value)}
                      placeholder="Enter your webhook verify token"
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Business Profile ID</label>
                    <input
                      type="text"
                      value={settings.whatsappBusinessProfileId || ''}
                      onChange={(e) => updateSetting('whatsappBusinessProfileId', e.target.value)}
                      placeholder="Enter your Business Profile ID (optional)"
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>
                </>
              )}

              <div className="pt-4 border-t border-gray-200">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.whatsappAIEnabled || false}
                    onChange={(e) => updateSetting('whatsappAIEnabled', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm font-medium text-gray-700">Enable AI-Powered Features</span>
                </label>
                <p className="text-xs text-gray-500 mt-1 ml-6">Enable smart auto-responses, sentiment analysis, and predictive engagement</p>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={handleSaveSettings}
                  disabled={saveStatus === 'saving'}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 text-sm"
                >
                  {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? '✓ Saved' : 'Save Configuration'}
                </button>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Setup Instructions</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• <strong>Not Configured:</strong> WhatsApp features will be disabled</li>
                <li>• <strong>Meta Cloud API:</strong> Get credentials from developers.facebook.com/apps</li>
                <li>• <strong>Twilio:</strong> Get credentials from console.twilio.com</li>
                <li>• <strong>Webhook:</strong> Configure webhook URL in Meta for real-time message updates</li>
                <li>• <strong>AI Features:</strong> Enable for smart auto-responses and sentiment analysis</li>
              </ul>
            </div>
          </div>
        )}

        {/* Call Configuration */}
        {activeTab === 'call' && (
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📞 Call Integration Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
                <select
                  value={settings.callProvider || 'custom'}
                  onChange={(e) => updateSetting('callProvider', e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="custom">Not Configured</option>
                  <option value="twilio">Twilio</option>
                  <option value="plivo">Plivo</option>
                  <option value="nexmo">Nexmo (Vonage)</option>
                </select>
              </div>

              {settings.callProvider && settings.callProvider !== 'custom' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                    <input
                      type="text"
                      value={settings.callApiKey || ''}
                      onChange={(e) => updateSetting('callApiKey', e.target.value)}
                      placeholder="Enter your API key"
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">API Secret</label>
                    <input
                      type="password"
                      value={settings.callApiSecret || ''}
                      onChange={(e) => updateSetting('callApiSecret', e.target.value)}
                      placeholder="Enter your API secret"
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Caller ID (Optional)</label>
                    <input
                      type="text"
                      value={settings.callCallerId || ''}
                      onChange={(e) => updateSetting('callCallerId', e.target.value)}
                      placeholder="Enter your caller ID"
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>
                </>
              )}

              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={handleSaveSettings}
                  disabled={saveStatus === 'saving'}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 text-sm"
                >
                  {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? '✓ Saved' : 'Save Configuration'}
                </button>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Setup Instructions</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• <strong>Not Configured:</strong> Call features will be disabled</li>
                <li>• <strong>Twilio:</strong> Get API keys from twilio.com/console</li>
                <li>• <strong>Plivo:</strong> Get credentials from plivo.com/dashboard</li>
                <li>• <strong>Nexmo:</strong> Get API key from vonage.com</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}