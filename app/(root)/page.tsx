import { auth } from '@/auth';
import BookList from '@/components/BookList';
import BookOverview from '@/components/BookOverview';
import { sampleBooks } from '@/constants';
import { db } from '@/lib/db';

const Home = async () => {
  const session = await auth();

  const latestBooks = (await db.books.findMany({
    take: 10,
    orderBy: {
      createAt: 'desc',
    },
  })) as unknown as Book[];
  return (
    <>
      <BookOverview {...latestBooks[0]} userId={session?.user?.id as string} />
      <BookList
        title='Latest Books'
        books={latestBooks.slice(1)}
        containerClassName='mt-28'
      />
    </>
  );
};
export default Home;
