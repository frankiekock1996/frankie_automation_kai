import PostsTable from '@/components/posts/PostsTable';
import BackButton from '@/components/ui/backbutton';
import PostsPagination from '@/components/posts/PostsPagination';

const PostsPage = () => {
  return (
    <>
      <BackButton text='Go Back' link='/' />
      <PostsTable />
      <PostsPagination />
    </>
  );
};

export default PostsPage;