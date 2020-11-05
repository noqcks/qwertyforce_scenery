/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-var-requires */
// import db_ops from './../helpers/db_ops'
import { Request, Response } from 'express';
import { RecaptchaResponseV3 } from 'express-recaptcha/dist/interfaces';
import image_ops from '../helpers/image_ops'

async function reverse_search(req: Request, res: Response) {
    const recaptcha_score=(req.recaptcha as RecaptchaResponseV3)?.data?.score
    if (req.recaptcha?.error|| (typeof recaptcha_score==="number" && recaptcha_score<0.5)) {
        return res.status(403).json({
            message: "Captcha error"
        });
    }
    
    if(req.file){
        const Mode=parseInt(req.body.mode)
        req.setTimeout(120000)//2min
        if(Mode===1){
            const ids=await image_ops.get_similar_images_by_phash(req.file.buffer)
            console.log(ids)
            res.json({ids:ids.join(',')})
        }else if(Mode===2){
            const ids=await image_ops.get_similar_images_by_orb(req.file.buffer)
            console.log(ids)
            res.json({ids:ids.join(',')})
        }
       
    }
}

export default reverse_search;