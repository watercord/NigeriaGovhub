import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import
 Image from 'next/image';
import
 logo from './logo.png'


export function Logo() {
  return (
    <Link
 href="/" className="flex items-center space
-x-2 text-primary
 hover:text-primary/90 transition-colors">
      <Image src={logo} alt
="NigeriaGovHub Logo" className='h-11 w-14' />
    </Link>
  );
}
