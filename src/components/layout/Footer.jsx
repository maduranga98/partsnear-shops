import { cn } from '../../utils/helpers';

const Footer = ({ className }) => {
  const year = new Date().getFullYear();

  return (
    <footer className={cn('py-6 mt-auto border-t border-border bg-surface', className)}>
      <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[13px] text-text-secondary">
        <p>© {year} PartsNear. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-primary transition-colors">Help Center</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
