import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Check, 
  ExternalLink,
  MessageCircle,
  Facebook,
  Globe
} from 'lucide-react';
import Badge from '../../components/ui/Badge';
import Card from '../../components/ui/Card';

const ProfilePreview = ({ shop }) => {
  if (!shop) return null;

  return (
    <div className="bg-surface min-h-screen pb-20">
      {/* Cover Photo */}
      <div className="h-48 md:h-64 bg-surface-3 relative overflow-hidden">
        {shop.coverPhoto ? (
          <img src={shop.coverPhoto} alt="Cover" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-muted">
            <ImageIcon size={48} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-darkest/60 to-transparent" />
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-12 relative z-10">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Shop Logo & Basic Info */}
          <div className="flex-1 space-y-6">
            <div className="flex flex-col md:flex-row md:items-end gap-4">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl border-4 border-white bg-white shadow-xl overflow-hidden shrink-0">
                {shop.logo ? (
                  <img src={shop.logo} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-primary/10 text-primary flex items-center justify-center font-black text-2xl">
                    {shop.shopName?.[0]}
                  </div>
                )}
              </div>
              
              <div className="pb-2">
                <h1 className="text-3xl font-black text-white md:text-text-primary drop-shadow-md md:drop-shadow-none tracking-tight">
                  {shop.shopName || 'Your Shop Name'}
                </h1>
                {shop.tagline && (
                  <p className="text-white/80 md:text-text-secondary font-medium mt-1">
                    {shop.tagline}
                  </p>
                )}
              </div>
            </div>

            <Card className="p-6 border-none ring-1 ring-border/50">
              <h2 className="text-lg font-bold text-text-primary mb-4">About the Shop</h2>
              <p className="text-text-body text-[15px] leading-relaxed whitespace-pre-wrap">
                {shop.description || 'No description provided yet.'}
              </p>
              
              {shop.categories?.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {shop.categories.map(cat => (
                    <Badge key={cat} variant="primary-bg" className="text-primary font-bold">
                      {cat}
                    </Badge>
                  ))}
                </div>
              )}
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {/* Contact Card */}
               <Card className="p-6 border-none ring-1 ring-border/50 space-y-4">
                  <h3 className="font-bold text-text-primary mb-2">Contact Details</h3>
                  <div className="space-y-3">
                    {shop.phones?.map((p, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm text-text-body">
                        <Phone size={16} className="text-primary" />
                        <span>{p}</span>
                      </div>
                    ))}
                    {shop.email && (
                      <div className="flex items-center gap-3 text-sm text-text-body">
                        <Mail size={16} className="text-primary" />
                        <span>{shop.email}</span>
                      </div>
                    )}
                    <div className="flex gap-4 pt-2">
                      {shop.whatsapp && (
                        <a href={`https://wa.me/${shop.whatsapp}`} className="p-2 bg-success/10 text-success rounded-lg hover:bg-success/20 transition-colors">
                          <MessageCircle size={20} />
                        </a>
                      )}
                      {shop.facebook && (
                        <a href={shop.facebook} className="p-2 bg-navy/10 text-navy rounded-lg hover:bg-navy/20 transition-colors">
                          <Facebook size={20} />
                        </a>
                      )}
                    </div>
                  </div>
               </Card>

               {/* Specializations Card */}
               <Card className="p-6 border-none ring-1 ring-border/50">
                  <h3 className="font-bold text-text-primary mb-4">We Specialize In</h3>
                  <div className="flex flex-wrap gap-2">
                    {shop.brands?.map(brand => (
                      <span key={brand} className="px-3 py-1 bg-surface-2 text-text-secondary text-[11px] font-bold rounded-full border border-border">
                        {brand}
                      </span>
                    ))}
                  </div>
               </Card>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="w-full md:w-80 space-y-6">
            {/* Location Card */}
            <Card className="p-6 border-none ring-1 ring-border/50">
              <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2">
                <MapPin size={18} className="text-primary" /> Location
              </h3>
              <p className="text-[13px] text-text-body font-medium mb-4">
                {shop.address || 'Address not listed'}
              </p>
              <div className="h-40 bg-surface-3 rounded-lg flex items-center justify-center text-[10px] text-text-muted font-bold uppercase tracking-widest border border-border">
                {shop.lat ? 'Map Preview' : 'No Location Data'}
              </div>
            </Card>

            {/* Hours Card */}
            <Card className="p-6 border-none ring-1 ring-border/50">
              <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2">
                <Clock size={18} className="text-primary" /> Business Hours
              </h3>
              <div className="space-y-2">
                {shop.hours ? Object.entries(shop.hours).map(([day, data]) => (
                  <div key={day} className="flex justify-between text-[12px] font-medium">
                    <span className="capitalize text-text-secondary">{day}</span>
                    <span className={data.closed ? 'text-error' : 'text-text-primary'}>
                      {data.closed ? 'Closed' : `${data.open} - ${data.close}`}
                    </span>
                  </div>
                )) : (
                  <p className="text-text-muted italic text-[12px]">Schedule not updated</p>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Gallery Section */}
        {shop.gallery?.length > 0 && (
          <div className="mt-12 space-y-4">
            <h2 className="text-xl font-bold text-text-primary">Shop Gallery</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {shop.gallery.map((url, i) => (
                <div key={i} className="aspect-square rounded-xl overflow-hidden ring-1 ring-border/50 hover:ring-primary transition-all cursor-pointer group">
                  <img src={url} alt={`Gallery ${i}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePreview;
