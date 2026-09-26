import headingFont from '@/assets/fonts/oswald-600.ttf?inline';
import bodyFont from '@/assets/fonts/inter-latin.woff2?inline';

export default function PosterTypography() {
  return <style>{`
    @font-face { font-family: PosterOswald; src: url('${headingFont}') format('truetype'); font-weight: 600; }
    @font-face { font-family: PosterInter; src: url('${bodyFont}') format('woff2'); font-weight: 100 900; }
    .playoff-type text { font-family: PosterInter, sans-serif; font-weight: 500; }
    .playoff-type .poster-title { font-family: PosterOswald, sans-serif; font-weight: 600; letter-spacing: 1px; }
  `}</style>;
}
