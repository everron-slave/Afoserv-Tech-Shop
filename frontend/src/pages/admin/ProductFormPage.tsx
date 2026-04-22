import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, X } from 'lucide-react';
import { useProductStore } from '../../store/productStore';

interface ProductFormData {
  name: string;
  price: number;
  category: string;
  imageUrl: string;
  description: string;
  specifications: string;
}

const ProductFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const { getProduct, addProduct, updateProduct, isLoading: isSubmitting } = useProductStore();

  // Available categories
  const categories = ['UBIQUITI', 'HDD', 'SSD', 'APPLE', 'HPE AURA SWITCHES', 'Recommended'];

  // Initial form state
  const initialFormData: ProductFormData = {
    name: '',
    price: 0,
    category: categories[0],
    imageUrl: '',
    description: '',
    specifications: JSON.stringify([{label: '', value: ''}], null, 2),
  };

  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch product data for editing
  useEffect(() => {
    if (isEditMode && id) {
      const product = getProduct(id);
      if (product) {
        setFormData({
          name: product.name,
          price: product.price,
          category: product.category,
          imageUrl: product.imageUrl,
          description: product.description,
          specifications: JSON.stringify(product.specifications || [{label: '', value: ''}], null, 2),
        });
      }
    }
  }, [id, isEditMode, getProduct]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || 0 : value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (formData.price <= 0) newErrors.price = 'Price must be greater than 0';
    if (!formData.imageUrl.trim()) newErrors.imageUrl = 'Image URL is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';

    // Validate JSON specifications
    if (formData.specifications.trim()) {
      try {
        JSON.parse(formData.specifications);
      } catch {
        newErrors.specifications = 'Specifications must be valid JSON';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const productData = {
        name: formData.name,
        price: formData.price,
        category: formData.category,
        imageUrl: formData.imageUrl,
        description: formData.description,
        specifications: formData.specifications.trim() ? JSON.parse(formData.specifications) : [{label: '', value: ''}],
      };

      if (isEditMode && id) {
        await updateProduct(id, productData);
        alert('Product updated successfully!');
      } else {
        await addProduct(productData);
        alert('Product created successfully!');
      }
      
      navigate('/admin/products');
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product. Please try again.');
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
      navigate('/admin/products');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate('/admin/products')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </button>
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditMode ? 'Edit Product' : 'Add New Product'}
          </h2>
          <p className="text-gray-600 mt-1">
            {isEditMode ? 'Update product information' : 'Add a new product to your catalog'}
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                placeholder="Enter product name"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            {/* Price */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Price (USD) *
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                className={`w-full px-3 py-2 border ${errors.price ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                placeholder="0.00"
              />
              {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Image URL */}
            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
                Image URL *
              </label>
              <input
                type="url"
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${errors.imageUrl ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                placeholder="https://example.com/image.jpg"
              />
              {errors.imageUrl && <p className="mt-1 text-sm text-red-600">{errors.imageUrl}</p>}
              
              {/* Image preview */}
              {formData.imageUrl && (
                <div className="mt-3">
                  <p className="text-sm text-gray-500 mb-1">Preview:</p>
                  <div className="w-32 h-32 bg-gray-100 overflow-hidden border border-gray-300">
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Invalid+URL';
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className={`w-full px-3 py-2 border ${errors.description ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
              placeholder="Enter product description"
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
          </div>

          {/* Specifications (JSON) */}
          <div>
            <label htmlFor="specifications" className="block text-sm font-medium text-gray-700 mb-1">
              Specifications (JSON)
            </label>
            <textarea
              id="specifications"
              name="specifications"
              value={formData.specifications}
              onChange={handleChange}
              rows={6}
              className={`w-full px-3 py-2 border ${errors.specifications ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm`}
              placeholder='[{"label": "Processor", "value": "Intel Core i7"}, {"label": "RAM", "value": "16GB"}]'
            />
            {errors.specifications ? (
              <p className="mt-1 text-sm text-red-600">{errors.specifications}</p>
            ) : (
              <p className="mt-1 text-sm text-gray-500">
                Enter specifications as JSON array of objects with "label" and "value" properties.
              </p>
            )}
          </div>

          {/* Form actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors flex items-center"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Saving...' : isEditMode ? 'Update Product' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>

      {/* Help text */}
      <div className="bg-blue-50 border border-blue-200 p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-1">Form Instructions</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Fields marked with * are required</li>
          <li>• Image URL should be a direct link to the product image</li>
          <li>• Specifications should be valid JSON format (optional)</li>
          <li>• Product will be added to the catalog immediately upon saving</li>
        </ul>
      </div>
    </div>
  );
};

export default ProductFormPage;