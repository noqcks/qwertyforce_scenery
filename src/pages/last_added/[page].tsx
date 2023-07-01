import { makeStyles } from 'tss-react/mui';
import AppBar from '../../components/AppBar'
import db_ops from '../../server/helpers/db_ops'
import Pagination from '@mui/material/Pagination'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import Link from '../../components/Link'
import Footer from '../../components/Footer'
import GalleryWrapper from '../../components/GalleryWrapper'
import ErrorPage from 'next/error'
import PaginationItem from '@mui/material/PaginationItem'
import PhotoInterface from '../../types/photo'

const IMAGES_ON_PAGE = 100
const useStyles = makeStyles()(() => ({
  flex_center: {
    display: "flex",
    justifyContent: 'center'
  },
  visible: {
    visibility: "visible"
  },
  hidden: {
    visibility: "hidden"
  }
}));

interface LastAddedPageProps {
  photos: PhotoInterface[],
  current_page: number,
  max_page: number,
  err: boolean
}


export default function LastAddedPage(props: LastAddedPageProps) {
  const { classes } = useStyles()
  const router = useRouter()
  if (router.isFallback) {
    return <ErrorPage statusCode={404} />
  }
  if (props.err) {
    return <ErrorPage statusCode={404} />
  }
  return (
    <div>
      <AppBar />
      <GalleryWrapper photos={props.photos} />
      <div className={classes.flex_center}>
        <Pagination count={props.max_page} defaultPage={props.current_page} renderItem={(item) => {
          return (<PaginationItem
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            component={Link as any}
            href={`/last_added/${item.page}`}
            prefetch={false}
            underline="none"
            {...item}
          />)
        }
        } siblingCount={3} color="primary" size="large" />
      </div>
      <Footer />
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const photos = []
  if (typeof context.params?.page === "string") {
    const page = parseInt(context.params.page)
    const total_num_of_images = await db_ops.image_ops.get_number_of_images_returned_by_search_query({})
    if (page >= 1 && page <= Math.ceil(total_num_of_images / IMAGES_ON_PAGE)) {
      const images = await db_ops.image_ops.batch_find_images({}, IMAGES_ON_PAGE * (page - 1), IMAGES_ON_PAGE)
      for (const image of images) {
        photos.push({
          src: `/thumbnails/${image.id}.jpg`,
          key: `/image/${image.id}`,
          width: image.width,
          height: image.height,
          title:image.caption
        })
      }
    }
    return {
      props: {
        photos: photos,
        current_page: page,
        max_page: Math.ceil(total_num_of_images / IMAGES_ON_PAGE)
      },
      // revalidate: 1 * 60 //1 min
    }
  } else {
    return {
      props: { err: true },
      // revalidate: 1 * 60 //1 min
    }
  }
}

// export const getStaticPaths: GetStaticPaths = async () => {
//   const total_num_of_images = await db_ops.image_ops.get_number_of_images_returned_by_search_query({})
//   const paths = []
//   for (let i = 1; i <= Math.ceil(total_num_of_images / IMAGES_ON_PAGE); i++) {
//     paths.push({ params: { page: i.toString() } })
//   }
//   return {
//     paths: paths,
//     fallback: true
//   }
// }

