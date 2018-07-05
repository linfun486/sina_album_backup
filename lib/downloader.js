'use strict';
var request = require('request'),
    fs = require('fs'),
    path = require('path');

class Downloader{
    constructor (uid){
        this.uid = uid;
        this.total = 0;
    }

    setCookie(cookie){
        this.cookie = cookie;
    }

    async dest(filepath){
        let albums = await this.albums();
        filepath += '/' + await this.name();

        for(let a in albums){
            let item = albums[a];
            let relativePath = filepath+'/'+item.caption;
            this.testDir(relativePath);
            let page = 1,
                photos;

            do{
                let resp = await this.photos(item.album_id, item.type, page);
                photos = resp.photo_list;

                for(let p in photos){
                    let photo = photos[p];
                    await this.save(photo, relativePath);
                }
                page++;
            }while(photos.length);
        }
        console.log('Finished', 'Total', this.total);
    }

    async albums(){
        let resp = await this._remoteJson('http://photo.weibo.com/albums/get_all', {
            uid:this.uid,
            count:20,
            page:1,
            __rnd:(new Date()).getTime()
        });
        return resp.album_list;
    }

    async name(){
        let body = await this._request('http://photo.weibo.com/'+this.uid+'/albums?rd=1', {});
        return body.match(/<title>(.*)的专辑/i)[1];
    }

    async photos(album_id, type, page = 1, count = 30){
        let resp = await this._remoteJson('http://photo.weibo.com/photos/get_all', {
            uid:this.uid,
            album_id:album_id,
            count:count,
            page:page,
            type:type,
            __rnd:(new Date()).getTime()
        });
        return resp;
    }

    save(data, filepath){
        this.runThrends++;
        let _this = this;
        return new Promise(function(resolve, reject){
            let url = data.pic_host + '/large/'+data.pic_name;
            request.get(url).on('error', (msg)=>{
                console.error(msg);
            }).pipe(fs.createWriteStream(filepath+'/'+data.pic_name)).on('finish', () => {
                console.log('Add image:', data.pic_name, filepath);
                _this.total++;
                resolve(data);
            });
        });
    }

    testDir(filepath){
        if(fs.existsSync(filepath)){
            return true;
        }else{
            if(this.testDir(path.dirname(filepath))){
                fs.mkdirSync(filepath);
                return true;
            }
        }
    }

    async _remoteJson(url, data){
        let body = await this._request(url, data);
        body = JSON.parse(body);
        if(body.code != 0){
            throw body.msg;
        }else{
            return body.data;
        }
    }

    _request(url, data, method = 'GET'){
        let keys = Object.keys(data),
            values = Object.values(data);

        url += '?'+ keys.map((item, key)=>{
            return item+'='+values[key];
        }).join('&');

        let options = {
            method:method,
            url:url,
            headers:{
                "Accept-Language": "zh-CN,zh;q=0.8",
                "User-Agent":"Mozilla/5.0 (Linux; U; Android 5.0.2; zh-cn; HTC M8Sd Build/LRX22G) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30",
                "Cookie":this.cookie
            }
        };
        return new Promise(function(resolve, reject){
            request(options, function (error, response, body) {
                if(error || response.statusCode != 200 || !body){
                    console.error('Request Error !!', url,'Response :',error, response.statusCode, body);
                    reject(body);
                }
                resolve(body);
            });
        });
    }
}

module.exports = function(uid){
    return new Downloader(uid);
}
