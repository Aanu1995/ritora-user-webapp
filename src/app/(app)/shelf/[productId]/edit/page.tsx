import { ProductEditPage } from '@/components/shelf/edit/product-edit-page';

interface PageProps {
  params: Promise<{ productId: string }>;
}

export default async function Page({ params }: PageProps) {
  const { productId } = await params;
  return <ProductEditPage productId={productId} />;
}
