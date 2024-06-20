import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

const COMMON_REQUEST_METHOD = 'POST'; //缺省请求方法
const DEFAULT_TIMEOUT = 120000; //缺省请求超时时间 2min

const config: AxiosRequestConfig = {
    // 设置超时时间（10s）
    timeout: DEFAULT_TIMEOUT,
    // 缺省请求方法
    method: COMMON_REQUEST_METHOD,
    // 跨域时候允许携带凭证
    withCredentials: true
};

// 工具函数，用于延迟一段时间
const sleep = (time: number) => {
    return new Promise((resolve) => {
        setTimeout(resolve, time);
    });
};

// 重试函数
export const retryRequest = async (requestFn: any, retryTimes = 1, retryInterval = 500) => {
    let error: any = null;

    for (let a = 0; a < retryTimes; a++) {
        try {
            const result = await requestFn();
            return Promise.resolve(result);
        } catch (err) {
            error = err;
            console.log(`retry ${a + 1} times, error: ${err}`);
            await sleep(retryInterval);
        }
    }

    return Promise.reject(error);
};

export class CustomAxiosInstance {
    instance: AxiosInstance;

    constructor(axiosConfig: AxiosRequestConfig) {
        this.instance = axios.create(axiosConfig);
        this.setupInterceptor();
    }

    setupInterceptor() {
        this.instance.interceptors.response.use(
            async (response: AxiosResponse) => {
                const { status, data } = response;
                const { code } = data;

                // 请求成功
                if ((status === 200 || status < 300 || status === 304) && code === 0) {
                    return Promise.resolve(data);
                } else {
                    return Promise.reject(data);
                }
            },
            (error: AxiosError) => {
                if (error.code === 'ERR_CANCELED') {
                    return Promise.reject('ERR_REQUEST_CANCELED');
                }

                if (error.code === 'ERR_NETWORK') {
                    return Promise.reject('ERR_NETWORK_EXCEPTION');
                }

                return Promise.reject(error);
            }
        );
    }

    /** 常用请求方法封装 */
    get(url: string, params: any = null, config: AxiosRequestConfig = {}) {
        return this.instance.get(url, { params, ...config });
    }

    post(url: string, data: any, config: AxiosRequestConfig = {}) {
        return this.instance.post(url, data, { ...config });
    }
}

export default new CustomAxiosInstance(config);
