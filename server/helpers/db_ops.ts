import {MongoClient} from 'mongodb'
import crypto from "crypto"
import config from '../../config/config'
const url = config.mongodb_url;
const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true
};
const db_main = 'Scenery';
const client = new MongoClient(url, options);
client.connect(function(err) {
    if (err) {
        console.log(err)
    } else {
        console.log("Connected successfully to db server");
    }
});
//////////////////////////////////////////////////////////////////////////////////////////////////COLLECTIONS
const IMAGES_COLLECTION=client.db(db_main).collection("images");
const USERS_COLLECTION=client.db(db_main).collection("users");
const NOT_ACTIVATED_USERS_COLLECTION=client.db(db_main).collection("not_activated_users");
const PASSWORD_RECOVERY_COLLECTION=client.db(db_main).collection("password_recovery");
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////////////////CREATE INDEXES
client.db(db_main).collection("images").createIndex({"id": 1}, {unique: true});
client.db(db_main).collection("images").createIndex({"tags": 1});
client.db(db_main).collection("not_activated_users").createIndex({"createdAt": 1}, {expireAfterSeconds: 86400});
client.db(db_main).collection("password_recovery").createIndex({"createdAt": 1}, {expireAfterSeconds: 86400});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function generate_id() {
    const id:Promise<string> = new Promise((resolve, reject) => {
        crypto.randomBytes(32, async function(ex, buffer) {
            if (ex) {
                reject("error");
            }
            const id = buffer.toString("base64").replace(/\/|=|[+]/g, '')
            const user = await find_user_by_id(id) //check if id exists
            if (user) {
                resolve(id);
            } else {
                const id_1 = await generate_id()
                resolve(id_1)
            }
        });
    });
    return id;
}

/////////////////////////////////////////////////////////////////////////////////////IMAGES OPS

async function check_if_image_exists_by_id(id:number){
    return Boolean(IMAGES_COLLECTION.countDocuments({id:id},{limit:1}))
}
async function add_tags_to_image_by_id(id:number,tags:string[]){
    await IMAGES_COLLECTION.updateOne({id:id}, { $push: {tags:{ $each:tags}}})
}

async function get_ids_and_phashes(){
    const data = IMAGES_COLLECTION.aggregate([{ $project : { id : 1, phash : 1,_id : 0} }]).toArray()
    return data
}

async function update_image_data_by_id(id:number,update:Record<string,unknown>){
    return IMAGES_COLLECTION.updateOne({id: id}, { $set: update })
}

async function get_all_images(){
    const imgs = IMAGES_COLLECTION.find({}).project({_id:0}).toArray()
    return imgs
}

async function find_images_by_tags(query:Record<string,unknown>){
    const imgs = IMAGES_COLLECTION.find(query).project({_id:0}).toArray()
    return imgs
}
async function find_image_by_sha512(hash:string){
    const img = IMAGES_COLLECTION.find({sha512: hash}).project({_id:0}).next()
    return img
}
async function find_image_by_id(id:number){
    const img = IMAGES_COLLECTION.find({id: id}).project({_id:0}).next()
    return img
}
async function find_image_by_booru_id(booru:string,id:number){
    const img = IMAGES_COLLECTION.find({booru:booru,booru_id: id}).project({_id:0}).next()
    return img
}

async function get_max_image_id(){
    const result = await IMAGES_COLLECTION.find({}).sort({id:-1}).limit(1).next()
    return result.id
}
async function delete_image_by_id(id:number){
    return IMAGES_COLLECTION.deleteOne({id:id})
}
async function add_image_by_object(image:any){
    return IMAGES_COLLECTION.insertOne(image)
}

async function add_image(id:number,file_ext:string,width:number,height:number,author:string,
    size:number,booru_link:string|false, 
    booru_likes:number,booru_dislikes:number,
    booru_id:number|false,booru_date:Date|false,source_url:string,tags:Array<string>,
    wilson_score:number,sha512:string,phash:string,description:string,booru:string|false){
    const image={
        id:id,
        file_ext:file_ext,
        created_at: new Date(),
        width:width,
        height:height,
        author: author,
        description:description,
        size:size,
        phash:phash,
        sha512:sha512,
        tags:tags,
        booru:booru,
        booru_id:booru_id,
        booru_likes:booru_likes,
        booru_dislikes:booru_dislikes,
        booru_link:booru_link,
        booru_date:booru_date,
        source_url:source_url,
        wilson_score:wilson_score
    }
    IMAGES_COLLECTION.insertOne(image)
}
/////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////PASSWORD RECOVERY
async function update_user_password_by_id(id:string,password:string):Promise<void> {
    USERS_COLLECTION.updateOne({id: id}, { $set: {password:password} })
}

async function delete_password_recovery_token(token:string):Promise<void> {
    PASSWORD_RECOVERY_COLLECTION.deleteOne({token: token})
}

async function save_password_recovery_token(token:string, user_id:string):Promise<void> {
    PASSWORD_RECOVERY_COLLECTION.insertOne({
        "createdAt": new Date(),
        token: token,
        user_id: user_id,
    })
}

async function find_user_id_by_password_recovery_token(token:string) {
    const user = PASSWORD_RECOVERY_COLLECTION.find({token: token}).limit(1).project({_id:0}).next()
    return user
}
////////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////ACTIVATED USER
async function check_if_user_exists_by_id(id:number){
    return Boolean(USERS_COLLECTION.countDocuments({id:id},{limit:1}))
}

async function check_if_user_exists_by_email(email:string){
    return Boolean(USERS_COLLECTION.countDocuments({email:email},{limit:1}))
}


async function find_user_by_email(email:string) {
    const user = USERS_COLLECTION.find({email: email}).limit(1).project({_id:0}).next()
    return user
}

async function find_user_by_oauth_id(oauth_id:string) {
    const user = USERS_COLLECTION.find({oauth_id: oauth_id}).limit(1).project({_id:0}).next()
    return user
}

 async function find_user_by_id(id:string) {
    const user = USERS_COLLECTION.find({id: id}).limit(1).project({_id:0}).next()
    return user
}

async function create_new_user_activated(email:string, pass:string) {
    const id=await generate_id()
    const user={
        email: email,
        id: id,
        password: pass,
        username:"",
        links:0,
        activated: true
    }
    IMAGES_COLLECTION.insertOne(user)
}


async function create_new_user_activated_github(oauth_id:string) {
    const id=await generate_id()
    USERS_COLLECTION.insertOne({
        oauth_id: oauth_id,
        id: id,
        username:"",
        links:0,
        activated: true
    })
    return id
}

async function create_new_user_activated_google(oauth_id:string,email:string) {
    const id=await generate_id()
    USERS_COLLECTION.insertOne({
        oauth_id: oauth_id,
        email_google:email,
        id: id,
        username:"",
        links:0,
        activated: true
    })
    return id
}
//////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////NOT ACTIVATED USER
async function find_not_activated_user_by_token(token:string) {
    const user = NOT_ACTIVATED_USERS_COLLECTION.find({token: token}).limit(1).project({_id:0}).next()
    return user
}

async function delete_not_activated_user_by_token(token:string) {
    NOT_ACTIVATED_USERS_COLLECTION.deleteOne({token:token})
}

async function create_new_user_not_activated(email:string, pass:string, token:string) {
    NOT_ACTIVATED_USERS_COLLECTION.insertOne({
        "createdAt": new Date(),
        email: email,
        token: token,
        password: pass,
        activated: false
    })
}
////////////////////////////////////////////////////////////////////////////////
// async function test(){
//     const x =await find_image_by_id(3)
//     console.log(x)
// }
// test()
export default {
    image_ops: {
        add_image,
        add_image_by_object,
        get_all_images,
        find_image_by_id,
        get_max_image_id,
        delete_image_by_id,
        find_images_by_tags,
        get_ids_and_phashes,
        find_image_by_sha512,
        check_if_image_exists_by_id,
        find_image_by_booru_id,
        update_image_data_by_id,
        add_tags_to_image_by_id,
    },
    password_recovery:{
        update_user_password_by_id,
        delete_password_recovery_token,
        save_password_recovery_token,
        find_user_id_by_password_recovery_token
    },
    activated_user:{
        check_if_user_exists_by_id,
        check_if_user_exists_by_email,
        find_user_by_email,
        find_user_by_oauth_id,
        find_user_by_id,
        create_new_user_activated,
        create_new_user_activated_github,
        create_new_user_activated_google,
    },
    not_activated_user:{
        find_not_activated_user_by_token,
        delete_not_activated_user_by_token,
        create_new_user_not_activated
    }
}