import { getBackendSrv } from '@grafana/runtime';

export const slugify = (str: string) => {
    str = str.replace(/^\s+|\s+$/g, ''); // trim leading/trailing white space
    str = str.toLowerCase(); // convert string to lowercase
    str = str.replace(/[^a-z0-9 -]/g, '') // remove any non-alphanumeric characters
             .replace(/\s+/g, '-') // replace spaces with hyphens
             .replace(/-+/g, '-'); // remove consecutive hyphens
    return str;
};

export const getUser = async () => {
    getBackendSrv().get('/api/user')
    .then((result) => {
        console.log('user', result);
        return(result);
    });
}
