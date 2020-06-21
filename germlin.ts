import CryptoJS from 'crypto-js'

interface AzureConfig {
    masterkey: string;
    serviceurl: string;
    methodname: string;

}
class Param {
    constructor(name: string, value: string) {
        this.name = name;
        this.value = value
    }
    name: string;
    value: string;
}

interface FetchParam {
    query: string;
    parameters: Array<Param>
}
class AuthParam {
    constructor(paramscount: number, methodname: string, date: string, key: string) {
        this.paramscount = paramscount;
        this.methodname = methodname;
        this.date = date;
        this.key = key
    }
    paramscount: number;
    methodname: string;
    date: string;
    key: string
}

class AzureGermlin {
    static myInstance: AzureGermlin = null;
    static config: AzureConfig;

    static getInstance() {
        if (AzureGermlin.myInstance == null) {
            AzureGermlin.myInstance = new AzureGermlin();
        }
        return this.myInstance;
    }

    public fetch(param: FetchParam): Promise<Response> {
        const today = new Date();
        const UTCstring = today.toUTCString();
        const auth = this.auth(new AuthParam(param.parameters.length, AzureGermlin.config.methodname, UTCstring, AzureGermlin.config.masterkey))
        return fetch(AzureGermlin.config.serviceurl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': auth,
                'x-ms-date': UTCstring
            },
            body: JSON.stringify({ query: param.query, parameters: param.parameters })
        });

    }
    public auth(param: AuthParam) {
        const signatureRaw = `POST${param.paramscount}${param.methodname}${param.date}`;
        const signatureBytes = CryptoJS.HmacSHA256(signatureRaw, CryptoJS.enc.Base64.parse(param.key));
        const signatureEncoded = signatureBytes.toString(CryptoJS.enc.Base64);
        return signatureEncoded;
    }
    constructor() {
    }
}

export const azuregermlinfetch = async (param: FetchParam) => {
    let instance = AzureGermlin.getInstance();
    return instance.fetch(param)
}


export const initAzureCosmos = (config: AzureConfig) => {
    AzureGermlin.config = config;
}



