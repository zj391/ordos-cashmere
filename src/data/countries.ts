// Country list with 6-language display names, used by all inquiry forms.

export interface Country {
  code: string;
  name_en: string;
  name_cn: string;
  name_de: string;
  name_fr: string;
  name_ja: string;
  name_kr: string;
}

export const COUNTRIES: Country[] = [
  { code: 'US', name_en: 'United States', name_cn: '美国', name_de: 'Vereinigte Staaten', name_fr: 'États-Unis', name_ja: 'アメリカ', name_kr: '미국' },
  { code: 'CN', name_en: 'China', name_cn: '中国', name_de: 'China', name_fr: 'Chine', name_ja: '中国', name_kr: '중국' },
  { code: 'DE', name_en: 'Germany', name_cn: '德国', name_de: 'Deutschland', name_fr: 'Allemagne', name_ja: 'ドイツ', name_kr: '독일' },
  { code: 'FR', name_en: 'France', name_cn: '法国', name_de: 'Frankreich', name_fr: 'France', name_ja: 'フランス', name_kr: '프랑스' },
  { code: 'IT', name_en: 'Italy', name_cn: '意大利', name_de: 'Italien', name_fr: 'Italie', name_ja: 'イタリア', name_kr: '이탈리아' },
  { code: 'GB', name_en: 'United Kingdom', name_cn: '英国', name_de: 'Vereinigtes Königreich', name_fr: 'Royaume-Uni', name_ja: 'イギリス', name_kr: '영국' },
  { code: 'JP', name_en: 'Japan', name_cn: '日本', name_de: 'Japan', name_fr: 'Japon', name_ja: '日本', name_kr: '일본' },
  { code: 'KR', name_en: 'South Korea', name_cn: '韩国', name_de: 'Südkorea', name_fr: 'Corée du Sud', name_ja: '韓国', name_kr: '한국' },
  { code: 'ES', name_en: 'Spain', name_cn: '西班牙', name_de: 'Spanien', name_fr: 'Espagne', name_ja: 'スペイン', name_kr: '스페인' },
  { code: 'PT', name_en: 'Portugal', name_cn: '葡萄牙', name_de: 'Portugal', name_fr: 'Portugal', name_ja: 'ポルトガル', name_kr: '포르투갈' },
  { code: 'NL', name_en: 'Netherlands', name_cn: '荷兰', name_de: 'Niederlande', name_fr: 'Pays-Bas', name_ja: 'オランダ', name_kr: '네덜란드' },
  { code: 'BE', name_en: 'Belgium', name_cn: '比利时', name_de: 'Belgien', name_fr: 'Belgique', name_ja: 'ベルギー', name_kr: '벨기에' },
  { code: 'CH', name_en: 'Switzerland', name_cn: '瑞士', name_de: 'Schweiz', name_fr: 'Suisse', name_ja: 'スイス', name_kr: '스위스' },
  { code: 'AT', name_en: 'Austria', name_cn: '奥地利', name_de: 'Österreich', name_fr: 'Autriche', name_ja: 'オーストリア', name_kr: '오스트리아' },
  { code: 'PL', name_en: 'Poland', name_cn: '波兰', name_de: 'Polen', name_fr: 'Pologne', name_ja: 'ポーランド', name_kr: '폴란드' },
  { code: 'CA', name_en: 'Canada', name_cn: '加拿大', name_de: 'Kanada', name_fr: 'Canada', name_ja: 'カナダ', name_kr: '캐나다' },
  { code: 'MX', name_en: 'Mexico', name_cn: '墨西哥', name_de: 'Mexiko', name_fr: 'Mexique', name_ja: 'メキシコ', name_kr: '멕시코' },
  { code: 'BR', name_en: 'Brazil', name_cn: '巴西', name_de: 'Brasilien', name_fr: 'Brésil', name_ja: 'ブラジル', name_kr: '브라질' },
  { code: 'AR', name_en: 'Argentina', name_cn: '阿根廷', name_de: 'Argentinien', name_fr: 'Argentine', name_ja: 'アルゼンチン', name_kr: '아르헨티나' },
  { code: 'AU', name_en: 'Australia', name_cn: '澳大利亚', name_de: 'Australien', name_fr: 'Australie', name_ja: 'オーストラリア', name_kr: '호주' },
  { code: 'NZ', name_en: 'New Zealand', name_cn: '新西兰', name_de: 'Neuseeland', name_fr: 'Nouvelle-Zélande', name_ja: 'ニュージーランド', name_kr: '뉴질랜드' },
  { code: 'IN', name_en: 'India', name_cn: '印度', name_de: 'Indien', name_fr: 'Inde', name_ja: 'インド', name_kr: '인도' },
  { code: 'AE', name_en: 'United Arab Emirates', name_cn: '阿联酋', name_de: 'Vereinigte Arabische Emirate', name_fr: 'Émirats arabes unis', name_ja: 'アラブ首長国連邦', name_kr: '아랍에미리트' },
  { code: 'SA', name_en: 'Saudi Arabia', name_cn: '沙特阿拉伯', name_de: 'Saudi-Arabien', name_fr: 'Arabie saoudite', name_ja: 'サウジアラビア', name_kr: '사우디아라비아' },
  { code: 'TR', name_en: 'Türkiye', name_cn: '土耳其', name_de: 'Türkei', name_fr: 'Turquie', name_ja: 'トルコ', name_kr: '터키' },
  { code: 'RU', name_en: 'Russia', name_cn: '俄罗斯', name_de: 'Russland', name_fr: 'Russie', name_ja: 'ロシア', name_kr: '러시아' },
  { code: 'SG', name_en: 'Singapore', name_cn: '新加坡', name_de: 'Singapur', name_fr: 'Singapour', name_ja: 'シンガポール', name_kr: '싱가포르' },
  { code: 'HK', name_en: 'Hong Kong', name_cn: '中国香港', name_de: 'Hongkong', name_fr: 'Hong Kong', name_ja: '香港', name_kr: '홍콩' },
  { code: 'TW', name_en: 'Taiwan', name_cn: '中国台湾', name_de: 'Taiwan', name_fr: 'Taïwan', name_ja: '台湾', name_kr: '대만' },
  { code: 'VN', name_en: 'Vietnam', name_cn: '越南', name_de: 'Vietnam', name_fr: 'Vietnam', name_ja: 'ベトナム', name_kr: '베트남' },
  { code: 'TH', name_en: 'Thailand', name_cn: '泰国', name_de: 'Thailand', name_fr: 'Thaïlande', name_ja: 'タイ', name_kr: '태국' },
  { code: 'ID', name_en: 'Indonesia', name_cn: '印度尼西亚', name_de: 'Indonesien', name_fr: 'Indonésie', name_ja: 'インドネシア', name_kr: '인도네시아' },
  { code: 'PH', name_en: 'Philippines', name_cn: '菲律宾', name_de: 'Philippinen', name_fr: 'Philippines', name_ja: 'フィリピン', name_kr: '필리핀' },
  { code: 'MY', name_en: 'Malaysia', name_cn: '马来西亚', name_de: 'Malaysia', name_fr: 'Malaisie', name_ja: 'マレーシア', name_kr: '말레이시아' },
  { code: 'ZA', name_en: 'South Africa', name_cn: '南非', name_de: 'Südafrika', name_fr: 'Afrique du Sud', name_ja: '南アフリカ', name_kr: '남아프리카공화국' },
  { code: 'EG', name_en: 'Egypt', name_cn: '埃及', name_de: 'Ägypten', name_fr: 'Égypte', name_ja: 'エジプト', name_kr: '이집트' },
  { code: 'NG', name_en: 'Nigeria', name_cn: '尼日利亚', name_de: 'Nigeria', name_fr: 'Nigeria', name_ja: 'ナイジェリア', name_kr: '나이지리아' },
  { code: 'OTHER', name_en: 'Other', name_cn: '其他', name_de: 'Andere', name_fr: 'Autre', name_ja: 'その他', name_kr: '기타' },
];

const LOCALE_TO_FIELD: Record<string, keyof Country> = {
  en: 'name_en', cn: 'name_cn', de: 'name_de', fr: 'name_fr', ja: 'name_ja', kr: 'name_kr',
};

export { LOCALE_TO_FIELD };

export function getCountryName(code: string, locale: string): string {
  const c = COUNTRIES.find((x) => x.code === code);
  if (!c) return code;
  const field = LOCALE_TO_FIELD[locale] || 'name_en';
  return c[field] || c.name_en;
}
