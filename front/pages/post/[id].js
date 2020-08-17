import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { END } from 'redux-saga';
import Head from 'next/head';
import AppLayout from '../../components/AppLayout';
import PostCard from '../../components/PostCard';
import wrapper from '../../store/configureStore';
import { LOAD_POST_REQUEST } from '../../reducers/post';

const Post = () => {
  const router = useRouter();
  const { id } = router.query;
  const { singlePost } = useSelector((state) => state.post);
  return (
    <AppLayout>
      <Head>
        <title>
          {singlePost.User.nickname}
          님의 글
        </title>
        <meta name='description' content={singlePost.content} />
        <meta property='og:title' content={`${singlePost.User.nickname}님의 게시글`} />
        <meta property='og:description' content={singlePost.content} />
        <meta
          property='og:image'
          content={singlePost.Images[0] ? singlePost.Images[0].src : 'https://jimmy.kr/favicon.ico'}
        />
        <meta property='og:url' content={`https://jimmy.kr/post/${id}`} />
      </Head>
      <PostCard post={singlePost} />
    </AppLayout>
  );
};

export const getServerSideProps = wrapper.getServerSideProps(async (context) => {
  context.store.dispatch({
    type: LOAD_POST_REQUEST,
    data: context.params.id,
  });
  context.store.dispatch(END);
  await context.store.sagaTask.toPromise();
  return { props: {} };
});

export default Post;
