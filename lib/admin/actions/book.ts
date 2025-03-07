'use server';

import { db } from '@/lib/db';

export const createBook = async (params: BookParams) => {
  try {
    console.log({
      ...params,
      availableCopies: params.totalCopies,
    });
    const newBook = await db.books.create({
      data: {
        ...params,
        availableCopies: params.totalCopies,
      },
    });

    return {
      success: true,
      data: JSON.parse(JSON.stringify(newBook)),
    };
  } catch (error) {
    console.log(error);

    return {
      success: false,
      message: 'An error occurred while creating the book',
    };
  }
};
