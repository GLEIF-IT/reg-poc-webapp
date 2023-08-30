interface SAD {
    a: EcrAttributes;
    d: string;
    e: Record<string, Link>;
    i: string;
    r: EcrRules;
    ri: string;
    s: string;
    u: string;
    v: string;
}

interface Link {
    n: string;
    o: string;
    s: string;
}

interface Content {
    v: string;
    d: string;
    dt: Date;
    s: string;
    ri: string;
    ra: Object;
    i: string;
    a : {
        d: string;
        s: number;
    }
}

interface EcrAttributes {
    AID: string;
    LEI: String;
    d: string;
    dt: Date;
    engagementContextRole: string;
    i: string;
    personLegalName: string;

}

interface EcrRules {
    d: string;
    rule: Record<"issuanceDisclaimer" | "privacyDisclaimer" | "usageDisclaimer", {
        l: string;
    }>
}



export interface ACDC {
    chains: ACDC[];
    pre: string;
    sad: SAD;
    sadigars: string[];
    sadigers: string[]; // TODO figure out the type and change it
    status: Content;
}