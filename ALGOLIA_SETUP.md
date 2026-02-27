# Algolia DocSearch Setup

This project uses Algolia DocSearch with custom ranking to prioritize UI documentation over API documentation.

## Document Priority Ranking

The search is configured to boost results in this order:

1. **Admin Guides** (score: 15) - Highest priority
2. **Getting Started** (score: 14)
3. **Features** (score: 12)
4. **AI Features** (score: 11)
5. **General Docs** (score: 10)
6. **API Reference** (score: 3) - Lowest priority unless "api" is in query

## Setup Steps

### 1. Apply for Algolia DocSearch (Free for Open Source)

Visit: https://docsearch.algolia.com/apply/

Fill out the form with:
- **Website URL:** https://docs.mongohacks.com
- **Repository:** https://github.com/mongodb/mongohacks-platform
- **Email:** your-email@mongodb.com

### 2. Get Your Credentials

Once approved, you'll receive:
- `appId` - Your Algolia application ID
- `apiKey` - Public search-only API key (safe for frontend)
- `indexName` - Usually `mongohacks-docs`

### 3. Update Configuration

Edit `docusaurus.config.ts` and replace placeholders:

```typescript
algolia: {
  appId: 'YOUR_APP_ID', // Replace with actual app ID
  apiKey: 'YOUR_SEARCH_API_KEY', // Replace with search API key
  indexName: 'mongohacks-docs', // Confirm index name
  // ... rest stays the same
}
```

### 4. Upload Crawler Configuration

Send `algolia-crawler-config.json` to Algolia support or configure via their dashboard.

**Key configuration:**
- `page_rank` values determine search result ordering
- `contextualSearch: true` ensures API docs only appear when relevant
- Custom `optionalFilters` boost/lower specific document types

### 5. Test Search

After setup:
1. Build and deploy docs: `npm run build && npm run serve`
2. Click search icon (top right)
3. Test queries:
   - "create event" → Should show admin guide first
   - "api events" → Should show API docs
   - "judging" → Should show feature docs, not API

## How It Works

### Ranking Formula

```
Final Score = page_rank + query_match + optional_filters_score
```

**Example:**
- Query: "create event"
- Admin guide match: 15 (page_rank) + 10 (exact match) + 15 (admin filter) = **40**
- API route match: 3 (page_rank) + 8 (partial match) + 3 (api filter) = **14**
- **Admin guide wins** ✅

### Contextual Search

`contextualSearch: true` means:
- Search checks current page context
- If user is on `/api/` pages, API results boost automatically
- If user types "api", API results boost
- Otherwise, UI docs dominate

## Customization

### Adjust Priorities

Edit `searchParameters.optionalFilters` in `docusaurus.config.ts`:

```typescript
optionalFilters: [
  'docusaurus_tag:admin<score=20>',  // Increase admin priority
  'docusaurus_tag:api<score=1>',     // Decrease API priority further
]
```

### Add New Sections

1. Add to `start_urls` in `algolia-crawler-config.json`
2. Set appropriate `page_rank` (higher = more important)
3. Re-upload crawler config

## Troubleshooting

**API docs still showing first:**
- Check `page_rank` values in crawler config
- Verify `contextualSearch: true` in Docusaurus config
- Try more specific query (e.g., "admin create event")

**Search not working:**
- Verify API credentials are correct
- Check browser console for errors
- Ensure crawler has run (can take 24h after setup)

**Wrong results:**
- Clear Algolia index and re-crawl
- Check `customRanking` in crawler config
- Adjust `optionalFilters` scores

## Resources

- [Algolia DocSearch Docs](https://docsearch.algolia.com/docs/what-is-docsearch)
- [Custom Ranking Guide](https://www.algolia.com/doc/guides/managing-results/must-do/custom-ranking/)
- [Contextual Search](https://docsearch.algolia.com/docs/tips/#contextual-search)
