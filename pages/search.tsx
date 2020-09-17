import React from "react";
import Gallery from "react-photo-gallery";
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '../components/AppBar'
import db_ops from '../server/helpers/db_ops'
import Pagination from '@material-ui/lab/Pagination';
import { useRouter } from 'next/router'
import Photo from '../components/Photo'
import ErrorPage from 'next/error'
const useStyles = makeStyles(() => ({
  pagination: {
    display: "flex",
    justifyContent: 'center'
  }
}));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function Search(props: any) {
  const classes = useStyles();
  const router = useRouter()
  if (props.err) {
    return <ErrorPage statusCode={404} />
  }
  return (
    <div>
      <AppBar />
      {/* 
  // @ts-ignore */ }
      <Gallery targetRowHeight={250} photos={props.photos} renderImage={Photo} />   {/* FIX THIS SHIT */}
      <div className={classes.pagination}>
        <Pagination count={props.max_page} defaultPage={props.current_page} onChange={(_e, p) => router.push(`/search?q=${props.search_query}&page=${p}`)} siblingCount={3} color="primary" size="large" />
      </div>
    </div>

  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getServerSideProps(context: any) {
  if (context.query.q) {
    const tags = (context.query.q.split(',')).map((tag: string) => tag.trim())
    const include_tags=[]
    const exclude_tags=[]
    for(const tag of tags){
      if(tag[0]==='-'){
       exclude_tags.push(tag.slice(1))
      }else{
       include_tags.push(tag)
      }
    }
    const images = await db_ops.image_ops.find_images_by_tags(include_tags,exclude_tags)
    const images_on_page = 30
    const photos = []
    let page;
    if (context.query.page) {
      page = parseInt(context.query.page)
    } else {
      page = 1
    }
    if (page <= Math.ceil(images.length / images_on_page)) {
      for (let i = (page - 1) * images_on_page; (i < (page) * images_on_page) && (i < images.length); i++) {
        photos.push({
          src: `/images/${images[i].id}.${images[i].file_ext}`,
          key: `/image/${images[i].id}`,
          width: images[i].width,
          height: images[i].height
        })
      }
      return {
        props: {
          photos: photos,
          search_query: context.query.q,
          current_page: page,
          max_page: Math.ceil(images.length / images_on_page)
        }
      }
    }
  }
  return {
    props: { err: true }, // will be passed to the page component as props
  }
}