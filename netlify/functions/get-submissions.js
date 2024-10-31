exports.handler = async function(event, context) {
  try {
    // Get submissions from Netlify Forms API
    const response = await fetch(
      `https://api.netlify.com/api/v1/forms/${process.env.FORM_ID}/submissions`,
      {
        headers: {
          Authorization: `Bearer ${process.env.NETLIFY_ACCESS_TOKEN}`
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const submissions = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify({
        submissions: submissions.map(sub => ({
          answer: sub.data.answer
        }))
      })
    };
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed fetching submissions' })
    };
  }
};
