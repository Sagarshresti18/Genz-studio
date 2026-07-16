const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

const searchYouTube = async (req, res, next) => {
  try {
    const query = req.query.q || 'Kannada hit songs audio';
    const pageToken = req.query.pageToken || '';
    
    // We can use native fetch in Node 18+
    let url = `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&q=${encodeURIComponent(query)}&part=snippet&type=video&videoCategoryId=10&maxResults=20`;
    if (pageToken) {
      url += `&pageToken=${pageToken}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    if (response.status === 403) {
      return res.status(403).json({ error: 'YouTube API quota limit reached. Please try again later.' });
    } else if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'Failed to fetch from YouTube API.' });
    }

    const results = (data.items || []).map(item => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails?.high?.url || ''
    }));

    return res.json({
      nextPageToken: data.nextPageToken || '',
      items: results
    });

  } catch (err) {
    next(err);
  }
};

module.exports = {
  searchYouTube
};
