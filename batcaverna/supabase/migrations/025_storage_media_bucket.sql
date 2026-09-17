-- ============================================================================
-- Migração 025: Bucket de Mídia (Supabase Storage) para Avatares e Banners
-- ============================================================================
-- Permite upload de fotos e vídeos direto para o Storage sem carregar o banco
-- com megabytes de data URLs base64.

-- 1. Criar bucket público 'media'
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,
  104857600, -- 100 MB (Vídeos em alta resolução e fotos)
  ARRAY[
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
    'image/gif',
    'image/avif',
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'video/x-m4v'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 104857600,
  allowed_mime_types = ARRAY[
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
    'image/gif',
    'image/avif',
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'video/x-m4v'
  ];

-- 2. Políticas de Leitura Pública
DROP POLICY IF EXISTS "Leitura publica de media" ON storage.objects;
CREATE POLICY "Leitura publica de media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'media');
