// Landing page copy and phone-screen list. Edit text here, not in the template.
//
// Phone screens live in public/landing/screens/<name>.{android,ios}.webp and are
// generated from 1080x2400 emulator captures with tools/landing-shots.py.

const SCREENS = '/landing/screens';

export type MoreIcon =
  'search' | 'cart' | 'bookmark' | 'users' | 'edit' | 'sliders' | 'moon' | 'phone';

export interface ScreenTab {
  key: string;
  label: string;
  caption: string;
  alt: string;
  android: string;
  ios: string;
}

function screen(name: string) {
  return { android: `${SCREENS}/${name}.android.webp`, ios: `${SCREENS}/${name}.ios.webp` };
}

export const CMS = {
  stores: {
    appStore: {
      href: 'https://apps.apple.com/us/app/yummy-social-recipes/id6762482882',
      badge: '/Download_on_the_App_Store_Badge_US-UK_RGB_blk_092917.svg',
      badgeAlt: 'Download on the App Store',
      qr: '/app_store_qr.svg',
      qrAlt: 'App Store QR კოდი',
      label: 'App Store',
    },
    googlePlay: {
      href: 'https://play.google.com/store/apps/details?id=com.tomakatcheishvili.yummy',
      badge: '/GetItOnGooglePlay_Badge_Web_color_English.svg',
      badgeAlt: 'Get it on Google Play',
      qr: '/play_store_qr.svg',
      qrAlt: 'Google Play QR კოდი',
      label: 'Google Play',
    },
  },

  hero: {
    logoLabel: 'Yummy — მთავარი',
    eyebrow: 'შენი ჯიბის სამზარეულო',
    title: ['აღმოაჩინე, გააზიარე', 'და მოამზადე გემრიელი კერძები'],
    sub: 'რეცეპტების კოლექციიდან დაწყებული — საყიდლების სიამდე. ყველაფერი, რაც ყოველდღიურ სამზარეულოს სჭირდება, ერთ აპლიკაციაში.',
    note: 'უფასო · iOS და Android',
    qrLink: 'QR კოდით ჩამოტვირთვა',
  },

  tabs: {
    sectionLabel: 'აპის შესაძლებლობები',
    listLabel: 'აპის ეკრანები',
    items: [
      {
        key: 'feed',
        label: 'ლენტა',
        caption:
          'აღმოაჩინე ახალი რეცეპტები სხვა მზარეულებისგან — ფოტოებით, მომზადების დროითა და სირთულით.',
        alt: 'Yummy-ს რეცეპტების ლენტა',
        ...screen('feed'),
      },
      {
        key: 'pantry',
        label: 'ძიება ინგრედიენტებით',
        caption:
          'ჩაწერე, რა გაქვს მაცივარში — Yummy გიჩვენებს რეცეპტებს და რამდენად ემთხვევა ისინი შენს ინგრედიენტებს.',
        alt: 'რეცეპტის ძიება ინგრედიენტებით',
        ...screen('pantry'),
      },
      {
        key: 'shopping',
        label: 'საყიდლების სია',
        caption:
          'ერთი შეხებით გადაიტანე რეცეპტის ინგრედიენტები სიაში — ისინი ავტომატურად დაჯგუფდება რეცეპტების მიხედვით.',
        alt: 'საყიდლების სია',
        ...screen('shopping'),
      },
      {
        key: 'create',
        label: 'რეცეპტის შექმნა',
        caption:
          'დაამატე საკუთარი რეცეპტი — ფოტო, აღწერა, მომზადების დრო და სირთულე — და გაუზიარე მეგობრებს.',
        alt: 'რეცეპტის შექმნის ეკრანი',
        ...screen('create'),
      },
    ] as ScreenTab[],
  },

  more: {
    eyebrow: 'და კიდევ',
    title: 'ყველაფერი, რაც სამზარეულოში გჭირდება',
    items: [
      { icon: 'search', title: 'ძიება ინგრედიენტებით', sub: 'რაც სახლში გაქვს' },
      { icon: 'cart', title: 'საყიდლების სია', sub: 'ერთი შეხებით' },
      { icon: 'bookmark', title: 'კოლექციები', sub: 'შენი პირადი წიგნი' },
      { icon: 'users', title: 'გაზიარება', sub: 'ოჯახთან და მეგობრებთან' },
      { icon: 'edit', title: 'საკუთარი რეცეპტები', sub: 'ფოტოთი და დეტალებით' },
      { icon: 'sliders', title: 'ფილტრები', sub: 'დრო, დიეტა, სამზარეულო' },
      { icon: 'moon', title: 'მუქი თემა', sub: 'საღამოს მზადებისთვის' },
      { icon: 'phone', title: 'სრულიად უფასო', sub: 'iOS და Android' },
    ] as { icon: MoreIcon; title: string; sub: string }[],
  },

  faq: {
    title: ['ხშირად დასმული', 'კითხვები'],
    items: [
      {
        q: 'Yummy უფასოა?',
        a: 'დიახ. Yummy სრულიად უფასოა — როგორც iPhone-ზე, ისე Android-ზე.',
      },
      {
        q: 'რომელ მოწყობილობებზე მუშაობს?',
        a: 'Yummy ხელმისაწვდომია iPhone-ზე App Store-იდან და Android ტელეფონებზე Google Play-დან.',
      },
      {
        q: 'შემიძლია რეცეპტის პოვნა იმით, რაც სახლში მაქვს?',
        a: 'დიახ. ჩაწერე ინგრედიენტები, რომლებიც გაქვს, და Yummy გიჩვენებს შესაბამის რეცეპტებს — თითოეულზე მითითებულია, რამდენად ემთხვევა შენს ინგრედიენტებს.',
      },
      {
        q: 'როგორ მუშაობს საყიდლების სია?',
        a: 'რეცეპტიდან ერთი შეხებით დაამატე ინგრედიენტები სიაში. ისინი ავტომატურად დაჯგუფდება რეცეპტების მიხედვით, ყიდვისას კი უბრალოდ მონიშნავ.',
      },
      {
        q: 'შემიძლია სიის ან რეცეპტის გაზიარება?',
        a: 'დიახ. რეცეპტი ან საყიდლების სია ერთი შეხებით გაუზიარე ოჯახს ან მეგობრებს — იშოპინგეთ და მოამზადეთ ერთად.',
      },
      {
        q: 'შემიძლია საკუთარი რეცეპტის დამატება?',
        a: 'რა თქმა უნდა. დაამატე ფოტო, აღწერა, მომზადების დრო, სამზარეულო და სირთულე — და შენს რეცეპტს სხვებიც ნახავენ.',
      },
    ],
  },

  download: {
    eyebrow: 'ჩამოტვირთე უფასოდ',
    title: 'დღეს საღამოს რას ამზადებ?',
    sub: 'ჩამოტვირთე Yummy — სამი წუთი საკმარისია პირველი რეცეპტისა და საყიდლების სიის შესაქმნელად.',
    qrNote: 'ან დაასკანერე ტელეფონით',
  },

  footer: {
    name: 'Yummy',
    line: '© 2026 Yummy · თბილისი, საქართველო · v 1.5.0',
  },
} as const;
