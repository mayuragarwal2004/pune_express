import { NextResponse } from 'next/server';
import db from '../../../../db'; // Update the path to your db file

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query'); // Search query
  const articleId = searchParams.get('articleId'); // Specific article ID
  let articleType = searchParams.get('articleType'); // Type of article
  const num = parseInt(searchParams.get('num')) || 5; // Number of results to return
  const sortBy = searchParams.get('sortBy') || 'created_datetime'; // Field to sort by
  const order = searchParams.get('order') || 'DESC'; // Order direction (ASC or DESC)
  const randomize = searchParams.get('randomize') === 'true'; // Randomize results

  try {
    // Fetch unique article types if articleType is 'random'
    if (articleType === 'random') {
      const types = await db.select('Type').from('news').distinct();
      if (types.length > 0) {
        const randomType = types[Math.floor(Math.random() * types.length)];
        articleType = randomType.Type;
      } else {
        articleType = null;
      }
    }

    let knexQuery = db('news');

    // Add search functionality if a query is provided
    if (query) {
      knexQuery = knexQuery.where(function() {
        this.where('Title', 'like', `%${query}%`)
            .orWhere('Description', 'like', `%${query}%`);
      });
    }

    // Filter by article ID or type if provided
    if (articleId) {
      knexQuery = knexQuery.where('ArticleId', articleId);
    } else if (articleType) {
      knexQuery = knexQuery.where('Type', articleType);
    }

    // Apply sorting and ordering
    if (randomize) {
      knexQuery = knexQuery.orderByRaw('RAND()');
    } else {
      knexQuery = knexQuery.orderBy(sortBy, order);
    }

    knexQuery = knexQuery.limit(num);

    const articles = await knexQuery;

    if (articles.length === 0) {
      return NextResponse.json({ error: 'No articles found' }, { status: 404 });
    }

    const response = articles.map(article => ({
      title: article.Title,
      description: article.Description,
      sphoto: article.Sphoto,
      lphoto: article.Lphoto,
      articleId: article.ArticleId,
      type: article.Type,
      date: article.created_datetime
    }));

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
  }
}
