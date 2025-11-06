/**
 * StockTwits Data Inspector
 * Run this in the browser console on StockTwits to see what data we can access
 */

console.log('=== STOCKTWITS DATA INSPECTOR ===\n');

// Find all message/post elements
const posts = document.querySelectorAll('[class*="Message"], [class*="StreamMessage"], article');
console.log(`Found ${posts.length} posts\n`);

if (posts.length > 0) {
  const firstPost = posts[0];
  console.log('FIRST POST STRUCTURE:');
  console.log('Classes:', firstPost.className);
  console.log('HTML:', firstPost.outerHTML.substring(0, 500) + '...\n');

  // Look for user information
  console.log('USER INFORMATION:');
  const userLink = firstPost.querySelector('a[href*="/"]');
  if (userLink) {
    console.log('- Username link:', userLink.href);
    console.log('- Username text:', userLink.textContent);
  }

  // Look for timestamps
  const timeElement = firstPost.querySelector('time, [datetime], [class*="time"]');
  if (timeElement) {
    console.log('- Time element:', timeElement.getAttribute('datetime') || timeElement.textContent);
  }

  // Look for message body
  const bodyElement = firstPost.querySelector('[class*="body"], [class*="content"], [class*="text"]');
  if (bodyElement) {
    console.log('- Message:', bodyElement.textContent.substring(0, 100) + '...');
  }

  console.log('\n');
}

// Check if we can access user profile data
console.log('CHECKING FOR USER PROFILE DATA:');

// Try to find user profile links
const userLinks = document.querySelectorAll('a[href^="/"]');
console.log(`Found ${userLinks.length} user-related links`);

// Sample a user link
if (userLinks.length > 0) {
  console.log('Sample user link:', userLinks[0].href);
  console.log('Link text:', userLinks[0].textContent);
}

console.log('\n=== WHAT WE NEED TO DETECT BOTS ===');
console.log(`
IDEAL DATA TO ACCESS:
1. Account age / join date
2. Total post count
3. Followers / Following ratio
4. Verified badge
5. Bio/description
6. Profile picture (default vs custom)
7. Post frequency (posts per day)
8. Same message posted to multiple tickers
9. Only posts, never replies
10. Regular posting intervals (every 5 min exactly)

NEXT STEPS:
- Click on a username to see profile
- Inspect what data is visible
- Check if we can fetch it via DOM
- Determine if we need to make API calls
`);

console.log('\n=== COPY THIS INFO TO CLAUDE ===');
