import { ProductDetailPage } from '@/components/shelf/detail/product-detail-page';

interface PageProps {
  params: Promise<{ productId: string }>;
}

export default async function Page({ params }: PageProps) {
  const { productId } = await params;
  return <ProductDetailPage productId={productId} />;
}
