import { Wrench, Headphones, Truck, Shield } from 'lucide-react'

const ServicesPage = () => {
  const services = [
    {
      icon: <Wrench className="w-8 h-8" />,
      title: 'Technical Support',
      description: '24/7 technical assistance for all your purchased products.',
    },
    {
      icon: <Headphones className="w-8 h-8" />,
      title: 'Customer Service',
      description: 'Dedicated support team to help with any inquiries or issues.',
    },
    {
      icon: <Truck className="w-8 h-8" />,
      title: 'Fast Delivery',
      description: 'Express shipping options available for all orders.',
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Warranty & Protection',
      description: 'Extended warranty and protection plans for peace of mind.',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Our Services</h1>
        <p className="text-gray-600 mt-2">
          We provide comprehensive support and services to ensure the best experience with your technology products.
        </p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.map((service, index) => (
          <div key={index} className="card hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-primary-50 rounded-lg text-primary-600">
                {service.icon}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{service.title}</h3>
                <p className="text-gray-600 mt-2">{service.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Info */}
      <div className="card bg-gradient-to-r from-primary-50 to-primary-100">
        <div className="max-w-3xl mx-auto text-center py-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Need Help?</h2>
          <p className="text-gray-700 mb-6">
            Our team is ready to assist you with any questions about our products or services.
            Contact us through WhatsApp for immediate assistance.
          </p>
          <button className="btn-primary">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  )
}

export default ServicesPage