interface RequestConfig extends RequestInit {
    controller?: AbortController;
    timeout?: number;
    retryCount?: number;
    retryInterval?: number;
    whitelist?: number[]; // 允许 resolve 的非0 code 码
}

// 涉及时间都是 ms
const DEFAULT_REQUEST_METHOD = 'POST';
const DEFAULT_REQUEST_MODE = 'same-origin';
const DEFAULT_REQUEST_CREDENTIALS = 'same-origin';
const DEFAULT_REQUEST_HEADERS = {
    'Content-type': 'application/json; charset=UTF-8'
};
const DEFAULT_TIMEOUT = 30000;
const DEFAULT_RETRY_COUNT = 0;
const DEFAULT_RETRY_INTERVAL = 500;
const DEFAULT_WHITELIST: number[] = [];

const defaultConfig: RequestConfig = {
    method: DEFAULT_REQUEST_METHOD,
    headers: DEFAULT_REQUEST_HEADERS,
    mode: DEFAULT_REQUEST_MODE,
    credentials: DEFAULT_REQUEST_CREDENTIALS,
    timeout: DEFAULT_TIMEOUT,
    retryCount: DEFAULT_RETRY_COUNT,
    retryInterval: DEFAULT_RETRY_INTERVAL,
    whitelist: DEFAULT_WHITELIST
};

const getDefaultConfig = (): RequestConfig => {
    const controller = new AbortController();
    return {
        ...defaultConfig,
        controller,
        signal: controller.signal
    };
};

const getQueryUrl = (url: string, params: any) => {
    if (!params) {
        return url;
    } else {
        const query = new URLSearchParams(params).toString();
        return `${url}?${query}`;
    }
};

const getTimeoutResponse = () => {
    return new Response(new Blob(), {
        status: 504,
        statusText: 'timeout'
    });
};

const getTimeoutPromise = (config: RequestConfig): Promise<Response> => {
    return new Promise((_, reject) => {
        setTimeout(() => {
            config?.controller?.abort();
            reject(getTimeoutResponse());
        }, config.timeout);
    });
};

export class FetchService {
    constructor() {
        if (!window.fetch) {
            window.alert('当前浏览器版本过低，请升级浏览器版本，推荐使用 Chrome 浏览器');
            throw new Error('当前浏览器版本过低，不支持 fetch');
        }
    }

    public async request(url: string, config: RequestConfig): Promise<any> {
        if (config.retryCount) {
            let attempt = 0;

            while (attempt < config.retryCount) {
                try {
                    const response = await Promise.race([fetch(url, config), getTimeoutPromise(config)]);

                    if (response?.ok) {
                        const result = await response.json();

                        if (result.code === 0 || config.whitelist?.includes(result.code)) {
                            return Promise.resolve(result);
                        } else {
                            throw response;
                        }
                    } else {
                        throw response;
                    }
                } catch (error: any) {
                    console.error('Loop Error', error);
                    if (attempt === config.retryCount - 1) {
                        return Promise.reject(error);
                    }

                    attempt++;
                    await this.wait(config.retryInterval as number);
                }
            }
        } else {
            const response = await Promise.race([fetch(url, config), getTimeoutPromise(config)]);

            if (response.ok) {
                const result = await response.json();

                if (result.code === 0 || config.whitelist?.includes(result.code)) {
                    return Promise.resolve(result);
                } else {
                    return Promise.reject(result);
                }
            } else {
                throw new Error(`error http status code: ${response.status}`);
            }
        }
    }

    public get(url: string, params: Record<string, any> | null, config: RequestConfig = {}): Promise<any> {
        const currentConfig: RequestConfig = {
            ...getDefaultConfig(),
            ...config,
            method: 'GET'
        };

        return this.request(getQueryUrl(url, params), currentConfig);
    }

    public post(url: string, params: Record<string, any> = {}, config: RequestConfig = {}): Promise<any> {
        const currentConfig: RequestConfig = {
            ...getDefaultConfig(),
            ...config,
            method: 'POST',
            body: JSON.stringify(params)
        };

        return this.request(url, currentConfig);
    }

    private wait(interval: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, interval));
    }
}

export default new FetchService();
