import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Camera, Save, Plus, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { notifyUserError, notifyUserInfo, notifyUserSuccess } from '../../lib/adminNotify';

interface Profile {
  id: string;
  name: string | null;
  avatar_url: string | null;
  country: string | null;
  timezone: string | null;
  locale: string | null;
  marketing_optin: boolean;
  custom_fields: Record<string, any>;
}

export default function PersonalInfoSection() {
  const { t } = useTranslation();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [customFields, setCustomFields] = useState<Array<{ key: string; value: string }>>([]);
  const [newField, setNewField] = useState({ key: '', value: '' });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile(data);
        const fields = Object.entries(data.custom_fields || {}).map(([key, value]) => ({
          key,
          value: String(value),
        }));
        setCustomFields(fields);
      } else {
        const newProfile = {
          id: user.user.id,
          name: null,
          avatar_url: null,
          country: null,
          timezone: 'UTC',
          locale: 'en',
          marketing_optin: false,
          custom_fields: {},
        };
        setProfile(newProfile);
      }
    } catch (error) {
      const { data: user } = await supabase.auth.getUser();
      if (user.user) {
        setProfile({
          id: user.user.id,
          name: null,
          avatar_url: null,
          country: null,
          timezone: 'UTC',
          locale: 'en',
          marketing_optin: false,
          custom_fields: {},
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    setSaving(true);
    try {
      const customFieldsObj = customFields.reduce((acc, field) => {
        if (field.key) acc[field.key] = field.value;
        return acc;
      }, {} as Record<string, string>);

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: profile.id,
          name: profile.name,
          country: profile.country,
          timezone: profile.timezone,
          locale: profile.locale,
          marketing_optin: profile.marketing_optin,
          custom_fields: customFieldsObj,
          avatar_url: profile.avatar_url,
        });

      if (error) throw error;
      notifyUserSuccess('Profile updated');
    } catch (error) {
      notifyUserError('Profile save failed');
    } finally {
      setSaving(false);
    }
  };

  const addCustomField = () => {
    if (newField.key && newField.value) {
      setCustomFields([...customFields, { ...newField }]);
      setNewField({ key: '', value: '' });
    }
  };

  const removeCustomField = (index: number) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      notifyUserInfo('File size must be less than 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      notifyUserInfo('Please upload an image file');
      return;
    }

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        notifyUserInfo('Please sign in to upload photos');
        return;
      }


      const fileExt = file.name.split('.').pop();
      const fileName = `${user.user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;


      const { data, error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {

      notifyUserInfo('Storage upload not available. Use an image URL instead.');
        return;
      }


      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const publicUrl = `${supabaseUrl}/storage/v1/object/public/profiles/${filePath}`;


      setProfile((prev) => (prev ? { ...prev, avatar_url: publicUrl } : prev));
      notifyUserSuccess('Photo uploaded');
    } catch (error) {
      notifyUserError('Upload failed. Use an image URL instead.');
    }
  };

  if (loading || !profile) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
        <p className="text-sm member-muted">{t('member.profile.loading')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="member-card p-6 shadow-lg">
            <h3 className="member-heading text-lg mb-4">{t('member.profile.photo')}</h3>
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-orange-500/30"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '';
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-600 to-orange-500 flex items-center justify-center">
                    <User className="h-16 w-16 text-white" />
                  </div>
                )}
                <input
                  type="file"
                  id="avatar-upload"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 p-2 bg-orange-600 rounded-full hover:bg-orange-700 transition-colors cursor-pointer"
                >
                  <Camera className="h-4 w-4 text-white" />
                </label>
              </div>
              <input
                type="text"
                value={profile.avatar_url || ''}
                onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
                placeholder={t('member.profile.imageUrl')}
                className="w-full px-4 py-2 member-input"
              />
              <div className="text-xs member-muted mt-2 text-center space-y-1">
                <p className="font-medium member-body">{t('member.profile.photoHintTitle')}</p>
                <p>{t('member.profile.photoHintUpload')}</p>
                <p>{t('member.profile.photoHintUrl')}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="member-card p-6 shadow-lg">
            <h3 className="member-heading text-lg mb-4">{t('member.profile.basicInfo')}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-neutral-200 mb-2">{t('member.profile.fullName')}</label>
                <input
                  type="text"
                  value={profile.name || ''}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full px-4 py-2 member-input"
                  placeholder={t('member.profile.fullNamePlaceholder')}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium member-body mb-2">{t('member.profile.country')}</label>
                  <input
                    type="text"
                    value={profile.country || ''}
                    onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                    className="w-full px-4 py-2 member-input"
                    placeholder={t('member.profile.countryPlaceholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium member-body mb-2">{t('member.profile.timezone')}</label>
                  <select
                    value={profile.timezone || 'UTC'}
                    onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                    className="w-full px-4 py-2 member-input"
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="Europe/London">London</option>
                    <option value="Europe/Paris">Paris</option>
                    <option value="Asia/Tokyo">Tokyo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profile.marketing_optin}
                    onChange={(e) => setProfile({ ...profile, marketing_optin: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                  />
                  <span className="text-sm member-body">
                    {t('member.profile.marketingOptin')}
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="mt-6 member-card p-6 shadow-lg">
            <h3 className="member-heading text-lg mb-4">{t('member.profile.customFields')}</h3>
            <p className="text-sm member-body mb-4">
              {t('member.profile.customFieldsBody')}
            </p>

            <div className="space-y-3 mb-4">
              {customFields.map((field, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={field.key}
                    onChange={(e) => {
                      const newFields = [...customFields];
                      newFields[index].key = e.target.value;
                      setCustomFields(newFields);
                    }}
                    className="flex-1 px-4 py-2 member-input"
                    placeholder={t('member.profile.fieldNamePlaceholder')}
                  />
                  <input
                    type="text"
                    value={field.value}
                    onChange={(e) => {
                      const newFields = [...customFields];
                      newFields[index].value = e.target.value;
                      setCustomFields(newFields);
                    }}
                    className="flex-1 px-4 py-2 member-input"
                    placeholder={t('member.profile.fieldValuePlaceholder')}
                  />
                  <button
                    onClick={() => removeCustomField(index)}
                    className="p-2 bg-red-50 border border-red-200 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newField.key}
                onChange={(e) => setNewField({ ...newField, key: e.target.value })}
                className="flex-1 px-4 py-2 member-input"
                placeholder={t('member.profile.fieldName')}
              />
              <input
                type="text"
                value={newField.value}
                onChange={(e) => setNewField({ ...newField, value: e.target.value })}
                className="flex-1 px-4 py-2 member-input"
                placeholder={t('member.profile.fieldValue')}
              />
              <button
                onClick={addCustomField}
                className="px-4 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                {t('member.profile.addField')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-3 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-lg hover:from-orange-500 hover:to-orange-600 transition-all disabled:opacity-50 flex items-center gap-2"
        >
          <Save className="h-5 w-5" />
          {saving ? t('member.profile.saving') : t('member.profile.saveChanges')}
        </button>
      </div>
    </div>
  );
}
