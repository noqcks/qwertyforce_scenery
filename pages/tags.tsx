import React from 'react';
import db_ops from '../server/helpers/db_ops'
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '../components/AppBar'
import { GetStaticProps } from 'next'
import Chip from '@material-ui/core/Chip';
import { Typography } from '@material-ui/core';

const useStyles = makeStyles(() => ({
  chip: {
    margin: 5
  }
}));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function Tags(props: any) {
  const classes = useStyles();
  const characters=["ahuizotl","amethyst star","amira","angel bunny","apple bloom","apple bumpkin","athena sparkle","autumn blaze","babs seed","berry dreams","berry punch","big macintosh","big daddy mccolt","blossomforth","bon bon","braeburn","bright mac","bulk biceps","chancellor puddinghead","cheerilee","cherry jubilee","cinder glow","clover the clever","coco pommel","coloratura","daybreaker","daring do","derpy hooves","discord","diamond tiara","fancypants","flim","flam","fleur-de-lis","flash sentry","granny smith","joan pommelway","lemon hearts","lyra heartstrings","maud pie","mayor mare","scootaloo","shining armor","silver spoon","silverstream","smart cookie","snips","snails",`soarin'`,"spike","spitfire","star swirl the bearded","star hunter","starlight glimmer","steven magnet","sugar belle","sunset shimmer","sweetie belle","tank","tempest shadow","thorax","trixie","twilight sparkle (alicorn)","twinkleshine","unicorn twilight","ursa","vapor trail","vinyl scratch","winona","zecora"]
  const Mane6=["rarity","applejack","twilight sparkle","fluttershy","rainbow dash","pinkie pie"]
  const Seasons=["winter","spring","summer","autumn"]
  const Styles=["traditional art","watercolor painting","acrylic painting","digital painting","oil painting","painting","bob ross","classic art","concept art","digital art","fine art emulation","fine art parody","pixel art","sketch","monochrome"]
  const Tags=[]
  const Mane6_tags=[]
  const Seasons_tags=[]
  const Characters_tags=[]
  const Styles_tags=[]
  for (const [tag_name, number_of_pictures] of props.tags) {
    const tag = <Chip label={`${tag_name} (${number_of_pictures})`} key={tag_name} className={classes.chip} component="a" href={`/search?q=${tag_name}`} clickable />
    if (Mane6.includes(tag_name)) {
      Mane6_tags.push(tag)
    } else if (Seasons.includes(tag_name)) {
      Seasons_tags.push(tag)
    }else if(characters.includes(tag_name)){
      Characters_tags.push(tag)
    }else if(Styles.includes(tag_name)){
      Styles_tags.push(tag)
    }
    else {
      Tags.push(tag)
    }
  }
  return (
    <div>
      <AppBar />
      <Typography variant="h6" gutterBottom>
        Mane 6
      </Typography>
      {Mane6_tags}
      <Typography variant="h6" gutterBottom>
        Characters
      </Typography>
      {Characters_tags}
      <Typography variant="h6" gutterBottom>
        Seasons
      </Typography>
      {Seasons_tags}
      <Typography variant="h6" gutterBottom>
        Styles
      </Typography>
      {Styles_tags}
      <Typography variant="h6" gutterBottom>
        Other
      </Typography>
      {Tags}
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const imgs = await db_ops.image_ops.get_all_images() 
  const filter_tag=(tag:string)=>{
    const filtered_tags=["width:","height:","artist:"]
     for(const f_tag of filtered_tags){
       if(tag.includes(f_tag)){
         return false
       }
     }
     return true
  }
  const tags = new Map()
  for (const img of imgs) {
    for (const tag of img.tags) {
      tags.set(tag,tags.get(tag)+1||1)
    }
  }
  const filtered_tags=[...tags].filter(([tag_name])=>filter_tag(tag_name))
  return {
    props: {
      tags: filtered_tags.sort(),
    },
    revalidate: 6 * 50 //5 min
  }
}
