import BookList from '@/components/BookList';
import BookOverview from '@/components/BookOverview';
import { sampleBooks } from '@/constants';
import { db } from '@/lib/db';

const Home = async () => {
  const result = await db.users.findMany({});
  console.log(JSON.stringify(result, null, 2));
  return (
    <>
      <BookOverview {...sampleBooks[0]} />
      <BookList
        title='Latest Books'
        books={sampleBooks}
        containerClassName='mt-28'
      />
    </>
  );
};
export default Home;
