import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Palette,
  Save,
  CheckCircle,
  Archive,
  ArrowLeft,
  Sparkles,
  Smartphone,
  Eye,
} from 'lucide-react';
import api from '../../lib/api';
import PageHeader from '../../components/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/Card';
import Input from '../../components/Input';
import Select from '../../components/Select';
import Button from '../../components/Button';
import JsonEditor from '../../components/JsonEditor';
import { FormSkeleton } from '../../components/Skeleton';
import { toast } from '../../components/Toast';

const templateSchema = z.object({
  name: z.string().min(3, 'Template name is required'),
  slug: z.string().min(3, 'Slug is required'),
  category: z.string(),
  is_premium: z.boolean(),
  thumbnail: z.string().url('Must be a valid image URL'),
});

const defaultTemplateConfig = {
  theme: 'gold_luxury',
  colors: {
    primary: '#D4AF37',
    secondary: '#FAF7F0',
    accent: '#1B5E4A',
    background: '#FFFFFF',
  },
  typography: {
    headingFont: 'Kantumruy Pro',
    bodyFont: 'Kantumruy Pro',
  },
  layout: {
    headerStyle: 'angkor_arch',
    showLoveStory: true,
    showPhotoGallery: true,
    showBlessingsWall: true,
    showBankKHQR: true,
  },
};

export function TemplateEditorPage() {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [jsonConfig, setJsonConfig] = useState(defaultTemplateConfig);
  const [isJsonValid, setIsJsonValid] = useState(true);

  const { data: template, isLoading } = useQuery({
    queryKey: ['admin', 'template', id],
    queryFn: async () => {
      const res = await api.get(`/admin/templates/${id}`);
      return res.data.data;
    },
    enabled: !isNew,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: '',
      slug: '',
      category: 'modern',
      is_premium: false,
      thumbnail: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=500',
    },
  });

  useEffect(() => {
    if (template) {
      reset({
        name: template.name,
        slug: template.slug,
        category: template.category || 'modern',
        is_premium: Boolean(template.is_premium),
        thumbnail: template.thumbnail,
      });
      if (template.config) {
        setJsonConfig(template.config);
      }
    }
  }, [template, reset]);

  const saveMutation = useMutation({
    mutationFn: async (formData) => {
      if (!isJsonValid) {
        throw new Error(t('templates.json_syntax_error'));
      }
      const payload = { ...formData, config: jsonConfig };
      if (isNew) {
        return api.post('/admin/templates', payload);
      }
      return api.put(`/admin/templates/${id}`, payload);
    },
    onSuccess: () => {
      toast.success('Template saved successfully.');
      queryClient.invalidateQueries({ queryKey: ['admin', 'templates'] });
      navigate('/templates');
    },
    onError: (err) => {
      toast.error(err?.message || 'Failed to save template.');
    },
  });

  if (isLoading && !isNew) return <FormSkeleton />;

  return (
    <div className="space-y-6">
      <PageHeader
        title={isNew ? t('templates.create_template') : t('templates.editor_title')}
        subtitle="Configure template visual tokens, section hierarchies, and layout rules"
        breadcrumbs={[
          { label: t('menu.dashboard'), to: '/' },
          { label: t('menu.templates'), to: '/templates' },
          { label: isNew ? 'New Template' : template?.name || 'Editor' },
        ]}
      />

      <form onSubmit={handleSubmit((d) => saveMutation.mutate(d))} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Metadata & JSON Editor (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Template Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label={t('templates.col_name')}
                    placeholder="e.g. Angkor Heritage Gold"
                    error={errors.name?.message}
                    {...register('name')}
                  />

                  <Input
                    label={t('templates.col_slug')}
                    placeholder="e.g. angkor-heritage-gold"
                    error={errors.slug?.message}
                    {...register('slug')}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Visual Category"
                    options={[
                      { value: 'modern', label: 'Modern Minimalist' },
                      { value: 'traditional', label: 'Traditional Khmer' },
                      { value: 'luxury', label: 'Royal & Luxury' },
                      { value: 'nature', label: 'Floral & Botanical' },
                    ]}
                    {...register('category')}
                  />

                  <Input
                    label="Cover Image URL"
                    placeholder="https://..."
                    error={errors.thumbnail?.message}
                    {...register('thumbnail')}
                  />
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="rounded text-brand-emerald-600 focus:ring-brand-emerald-500 w-4 h-4"
                      {...register('is_premium')}
                    />
                    <span>Mark as Premium Gold Tier Template</span>
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* JSON Configuration Code Editor */}
            <Card>
              <CardHeader>
                <CardTitle>{t('templates.config_json')}</CardTitle>
              </CardHeader>
              <CardContent>
                <JsonEditor
                  value={jsonConfig}
                  onChange={(parsed) => setJsonConfig(parsed)}
                  onValidityChange={(valid) => setIsJsonValid(valid)}
                  height="h-80"
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Real-time Live Preview Panel (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <Card className="sticky top-20">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Smartphone className="w-4 h-4 text-brand-emerald-700" />
                  <span>{t('templates.live_preview')}</span>
                </CardTitle>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                  Responsive Frame
                </span>
              </CardHeader>

              <CardContent className="pt-2 pb-6">
                {/* Mobile Preview Frame */}
                <div
                  className="max-w-xs mx-auto rounded shadow-xl overflow-hidden border-4 border-slate-800 transition-all"
                  style={{
                    backgroundColor: jsonConfig?.colors?.background || '#FFFFFF',
                    fontFamily: jsonConfig?.typography?.headingFont || 'Kantumruy Pro',
                  }}
                >
                  {/* Fake Phone Speaker & Notch */}
                  <div className="h-4 bg-slate-800 flex justify-center items-center">
                    <div className="w-12 h-1 bg-slate-700 rounded-full" />
                  </div>

                  {/* Header Banner */}
                  <div
                    className="p-6 text-center text-white transition-colors"
                    style={{
                      backgroundColor: jsonConfig?.colors?.primary || '#D4AF37',
                    }}
                  >
                    <span className="text-[10px] tracking-widest uppercase opacity-80">
                      Wedding Invitation
                    </span>
                    <h4 className="text-lg font-bold mt-2">Dara & Sreyleak</h4>
                    <p className="text-[10px] opacity-90 mt-1">November 28, 2026</p>
                  </div>

                  {/* Simulated Sections */}
                  <div className="p-4 space-y-3 text-xs text-slate-700">
                    {jsonConfig?.layout?.showLoveStory && (
                      <div className="p-2.5 rounded bg-slate-50 border border-slate-100">
                        <p className="font-bold text-[11px] text-slate-900 mb-0.5">Our Story</p>
                        <p className="text-[10px] text-slate-500">From our first meeting to our forever journey.</p>
                      </div>
                    )}

                    {jsonConfig?.layout?.showPhotoGallery && (
                      <div className="p-2.5 rounded bg-slate-50 border border-slate-100">
                        <p className="font-bold text-[11px] text-slate-900 mb-1">Pre-Wedding Photos</p>
                        <div className="grid grid-cols-3 gap-1">
                          <div className="h-10 bg-slate-200 rounded" />
                          <div className="h-10 bg-slate-200 rounded" />
                          <div className="h-10 bg-slate-200 rounded" />
                        </div>
                      </div>
                    )}

                    {jsonConfig?.layout?.showBankKHQR && (
                      <div
                        className="p-2.5 rounded border text-center"
                        style={{
                          borderColor: jsonConfig?.colors?.accent || '#1B5E4A',
                          backgroundColor: jsonConfig?.colors?.secondary || '#FAF7F0',
                        }}
                      >
                        <p className="font-bold text-[11px] text-slate-900">Bakong KHQR Gift</p>
                        <p className="text-[9px] text-slate-500">Scan to bless the couple</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between p-4 bg-white rounded border border-slate-200 shadow-xs">
          <Button
            type="button"
            variant="secondary"
            icon={ArrowLeft}
            onClick={() => navigate('/templates')}
          >
            {t('common.cancel')}
          </Button>

          <Button
            type="submit"
            variant="primary"
            icon={Save}
            loading={saveMutation.isPending || isSubmitting}
            disabled={!isJsonValid}
          >
            {t('common.save')}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default TemplateEditorPage;
