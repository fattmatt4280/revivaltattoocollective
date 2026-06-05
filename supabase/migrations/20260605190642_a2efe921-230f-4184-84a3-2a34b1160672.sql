UPDATE public.artists
SET instagram_handles = (
  SELECT jsonb_agg(
    CASE WHEN (h ? 'platform') THEN h ELSE h || jsonb_build_object('platform','instagram') END
  )
  FROM jsonb_array_elements(instagram_handles) h
)
WHERE jsonb_typeof(instagram_handles) = 'array'
  AND jsonb_array_length(instagram_handles) > 0;