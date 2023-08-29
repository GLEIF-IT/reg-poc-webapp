export interface AID {
  name: string;
  prefix: string;
  salty: Salty;
}

interface Salty {
  dcode: string;
  icodes: string[];
  kidx: number;
  ncodes: string[];
  pidx: number;
  stem: string;
  sxlt: string;
  tier: string;
  transferable: boolean;
}
