***

# Orion Insight API Documentation for Frontend

## 1. General Information

This guide provides everything you need to interact with the Tickers, Screener, and Watchlists APIs.

### 1.1 Authentication

All API endpoints are protected and require a specific two-header authentication scheme on **every request**. You must provide both your Access Token and your Refresh Token.

**Required Headers:**

1.  `Authorization`: The Bearer token containing your short-lived access token.
    *   **Format**: `Bearer <your_access_token>`

2.  `X-Refresh-Token`: A custom header containing your long-lived refresh token.
    *   **Format**: `<your_refresh_token>`

**Example Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
X-Refresh-Token: def50200f21782218a49104c97926b77...
```

If your access token is expired, the API will return a `401 Unauthorized` status. Your application should then use the refresh token to request a new set of tokens from the authentication endpoint.

### 1.2 Data Units & Currency

This is critical for correctly displaying financial data:

*   **Currency**: All monetary values in API requests and responses are in **United States Dollars (USD)**, even for stocks listed on foreign exchanges like the HKEX.
*   **Scale**: Key financial metrics are returned in **millions**.
    *   `market_cap_usd`
    *   `adtv_3m_usd` (Average Daily Trading Volume)
    *   **Example**: A `market_cap_usd` value of `2100000` in the API response represents **$2,100,000,000,000 USD** (2.1 Trillion USD). You will need to multiply the API value by `1,000,000` to get the full number.

### 1.3 Paginated Response Structure

Endpoints that return a list of items use a standardized paginated response object.

**Structure:**
```json
{
  "data": [ /* Array of result objects (e.g., Ticker objects) */ ],
  "total": 125,
  "page": 1,
  "size": 50,
  "pages": 3,
  "has_next": true,
  "has_prev": false
}
```

*   `data`: `Array` - The list of items for the current page.
*   `total`: `Integer` - The total number of items matching the query across all pages.
*   `page`: `Integer` - The current page number you are on (1-indexed).
*   `size`: `Integer` - The number of items you requested per page.
*   `pages`: `Integer` - The total number of pages available.
*   `has_next`: `Boolean` - `true` if there is another page of results after this one.
*   `has_prev`: `Boolean` - `true` if there is a previous page.

---

## 2. Response Object Schemas

These are the detailed structures of the data objects returned by the API.

### 2.1 Ticker Object

This object contains comprehensive information about a single stock ticker.

| Field                   | Type          | Description                                                                 |
| :---------------------- | :------------ | :-------------------------------------------------------------------------- |
| **Core Identifiers**    |               |                                                                             |
| `ticker`                | `String`      | The common stock ticker symbol (e.g., "AAPL").                              |
| `ric`                   | `String`      | The Refinitiv Instrument Code (e.g., "AAPL.O").                             |
| `company_name`          | `String`      | The legal name of the company (e.g., "Apple Inc").                          |
| `chinese_name`          | `String`      | The Chinese name of the company.                                            |
| `display_name`          | `String`      | The common name used for display purposes.                                  |
| `primary_instrument`    | `String`      | The RIC of the primary instrument.                                          |
| **Classification**      |               |                                                                             |
| `sector`                | `String`      | The GICS sector (e.g., "Information Technology").                           |
| `subsector`             | `String`      | The GICS industry group (e.g., "Technology Hardware, Storage & Peripherals"). |
| `industry`              | `String`      | The GICS industry (e.g., "Technology Hardware, Storage & Peripherals").     |
| `subindustry`           | `String`      | The GICS sub-industry (e.g., "Technology Hardware, Storage & Peripherals"). |
| `themes`                | `Array[String]` | A list of associated investment themes (e.g., ["Semiconductor & Chips"]). |
| `asset_category`        | `String`      | The type of asset (e.g., "ORDINARY SHARE").                                 |
| **Exchange Information**|               |                                                                             |
| `exchange`              | `String`      | The full name of the stock exchange (e.g., "NASDAQ").                       |
| `exchange_country_code` | `String`      | The two-letter country code of the exchange (e.g., "US", "HK").             |
| `quotation_currency`    | `String`      | The currency the stock is quoted in on its exchange (e.g., "USD", "HKD").   |
| `cf_currency`           | `String`      | The company's reporting currency.                                          |
| **Flags**               |               |                                                                             |
| `is_primary_listing`    | `Boolean`     | `true` if this is the company's primary listing globally.                   |
| `primary_quote_flag`    | `Boolean`     | `true` if this is the primary quote.                                        |
| **Financial Metrics**   |               |                                                                             |
| `market_cap_usd`        | `Number`      | Market capitalization in **millions USD**. Can be `null`.                     |
| `adtv_3m_usd`           | `Number`      | 3-month average daily trading volume in **millions USD**. Can be `null`.      |
| `pe_ltm`                | `Number`      | Price-to-Earnings ratio for the last twelve months. Can be `null`.            |
| `pe_fy1`                | `Number`      | Forward P/E ratio for the next fiscal year. Can be `null`.                  |
| `pe_fy2`                | `Number`      | Forward P/E ratio for the fiscal year after next. Can be `null`.              |
| `target_price_cons_pct` | `Number`      | Analyst consensus target price upside as a percentage (e.g., `15.5` for +15.5%). Can be `null`. |
| `last_price`            | `Number`      | The last closing price of the stock. Can be `null`.                           |
| **Timestamps**          |               |                                                                             |
| `metrics_updated_at`    | `String`      | ISO 8601 timestamp (UTC) of when financial metrics were last updated.       |
| `created_at`            | `String`      | ISO 8601 timestamp (UTC) of when the record was created.                    |
| `updated_at`            | `String`      | ISO 8601 timestamp (UTC) of when the record was last updated.               |

### 2.2 Watchlist Object

This object represents a user's personal watchlist.

| Field           | Type                     | Description                                                                      |
| :-------------- | :----------------------- | :------------------------------------------------------------------------------- |
| `id`            | `Integer`                | The unique identifier for the watchlist.                                         |
| `user_id`       | `String`                 | The ID of the user who owns the watchlist.                                       |
| `name`          | `String`                 | The name of the watchlist (e.g., "My Favorite Tech Stocks").                     |
| `tickers`       | `Array[String]`          | A simple list of the ticker symbols in this watchlist (e.g., `["AAPL", "MSFT"]`). |
| `tickers_details` | `Array[Ticker Object]` | An array of complete **Ticker Objects** for every ticker in the watchlist.       |
| `created_at`    | `String`                 | ISO 8601 timestamp (UTC) of when the watchlist was created.                      |
| `updated_at`    | `String`                 | ISO 8601 timestamp (UTC) of when the watchlist was last updated.                 |

---

## 3. Tickers & Screener Endpoints

These endpoints are for retrieving ticker information.

### 3.1 Get All Tickers (Simple List)

Retrieves a paginated list of all tickers in the system, with basic sorting.

*   **Method**: `GET`
*   **Endpoint**: `/orion-insight/tickers/`
*   **Returns**: A [Paginated Response](#13-paginated-response-structure) containing [Ticker Objects](#21-ticker-object).

### 3.2 Query and Filter Tickers (Advanced Screener)

A powerful endpoint to find specific tickers that match a combination of financial and descriptive criteria.

*   **Method**: `GET`
*   **Endpoint**: `/orion-insight/screener/query`
*   **Returns**: A [Paginated Response](#13-paginated-response-structure) containing [Ticker Objects](#21-ticker-object) that match the filters.

#### Filtering and Sorting Parameters
This endpoint accepts all parameters from the simple ticker list (`page`, `size`, `sort_by`, `sort_order`) plus the following filters.

| Parameter                  | Type          | Description                                                                 |
| :------------------------- | :------------ | :-------------------------------------------------------------------------- |
| **Core Identifiers**       |               |                                                                             |
| `tickers`                  | `List[String]`| Filter by a specific list of tickers.                                       |
| `ric`                      | `String`      | Filter by a specific Refinitiv Instrument Code.                             |
| `company_name`             | `String`      | Filter by company name (case-insensitive, partial match).                   |
| **Classification**         |               |                                                                             |
| `sectors`                  | `List[String]`| Filter by one or more GICS sectors (e.g., `?sectors=Technology&sectors=Healthcare`). |
| `industry`                 | `List[String]`| Filter by one or more GICS industries.                                      |
| **Exchange Information**   |               |                                                                             |
| `exchange_country_codes`   | `List[String]`| Filter by exchange country code (e.g., `?exchange_country_codes=US`).       |
| **Financial Metrics (USD)**|               | **Remember the scale**: value is in millions.                               |
| `min_market_cap`           | `Number`      | Minimum market cap in millions USD.                                         |
| `max_market_cap`           | `Number`      | Maximum market cap in millions USD.                                         |
| `min_adtv_3m`              | `Number`      | Minimum 3-month avg daily trading volume in millions USD.                   |
| `max_adtv_3m`              | `Number`      | Maximum 3-month avg daily trading volume in millions USD.                   |

> **Note**: A number of advanced analysis score filters (`min_total_score`, `recommendation_bias`, etc.) are present in the API but are **not yet implemented** on the backend. They will be ignored if sent.



# Field Values API

## Endpoint
`GET /orion-insight/screener/field-values`

## Description
Returns all available distinct values for string-based filter fields. This endpoint is essential for building filter UIs with dropdown options, as it provides all valid values that can be used in filter requests.

## Response
```json
{
  "sectors": ["Information Technology", "Health Care", "Financials", ...],
  "subsectors": ["Software & Services", "Technology Hardware & Equipment", ...],
  "industries": ["Software", "IT Services", "Biotechnology", ...],
  "subindustries": ["Application Software", "Systems Software", ...],
  "themes": ["Artificial Intelligence", "Electric Vehicles", "Cybersecurity", ...],
  "asset_categories": ["ORDINARY SHARE", "AMERICAN DEPOSITORY RECEIPT", ...],
  "exchanges": ["New York Stock Exchange", "Nasdaq Stock Market", ...],
  "exchange_country_codes": ["US", "HK"],
  "quotation_currencies": ["USD", "HKD", "CNY"],
  "cf_currencies": ["USD", "HKD", "CNY"],
}
```

## Use Cases
- Populate dropdown menus in filter interfaces
- Show users available filter options
- Validate filter parameters before making queries

## Integration
Use this endpoint to get valid values before making queries to `/orion-insight/screener/query`.


---

## 4. Watchlists Endpoints

These endpoints are for managing a user's personal watchlists.

### 4.1 Create a Watchlist

Creates a new watchlist.

*   **Method**: `POST`
*   **Endpoint**: `/orion-insight/watchlists/`
*   **Returns**: A `201 Created` status with the newly created [Watchlist Object](#22-watchlist-object) in the response body.

**Request Body:**
```json
{
  "name": "My Cloud Stocks",
  "tickers": ["MSFT", "GOOGL", "AMZN"]
}
```

### 4.2 Get User's Watchlists

Retrieves all watchlists for the logged-in user.

*   **Method**: `GET`
*   **Endpoint**: `/orion-insight/watchlists/`
*   **Returns**: A [Paginated Response](#13-paginated-response-structure) containing [Watchlist Objects](#22-watchlist-object).

### 4.3 Get a Specific Watchlist

Retrieves a single watchlist by its unique ID.

*   **Method**: `GET`
*   **Endpoint**: `/orion-insight/watchlists/{watchlist_id}`
*   **Returns**: A `200 OK` status with a single [Watchlist Object](#22-watchlist-object).
*   **Errors**: Returns `404 Not Found` if the ID doesn't exist or doesn't belong to the user.

### 4.4 Update a Watchlist

Updates a watchlist's name and/or its list of tickers.

*   **Method**: `PATCH`
*   **Endpoint**: `/orion-insight/watchlists/{watchlist_id}`
*   **Returns**: A `200 OK` status with the fully updated [Watchlist Object](#22-watchlist-object).

**Request Body (Partial):**
You only need to send the fields you want to change.
*   To rename: `{"name": "New Name"}`
*   To replace tickers: `{"tickers": ["TSLA", "NIO"]}`
    > **Important**: Providing the `tickers` array will **completely replace** the existing list of tickers with the new one.

*   **Errors**: Returns `404 Not Found` if the ID doesn't exist or doesn't belong to the user.

### 4.5 Delete a Watchlist

Permanently deletes a watchlist. This action cannot be undone.

*   **Method**: `DELETE`
*   **Endpoint**: `/orion-insight/watchlists/{watchlist_id}`
*   **Returns**: A `204 No Content` status on success, with an empty response body.
*   **Errors**: Returns `404 Not Found` if the ID doesn't exist or doesn't belong to the user.



# Get Latest Ticker Result API

## Overview

This endpoint retrieves the most recent analysis result for a given ticker symbol. It returns all CSV-derived columns from the `JobResults` table except for the `ric` field.

**Endpoint:** `GET /api/ticker/{ticker}/latest`

---

## Request

### URL Parameters

| Parameter | Type   | Required | Description                    |
|-----------|--------|----------|--------------------------------|
| `ticker`  | string | Yes      | The ticker symbol to query for |

### cURL Example

```bash
curl -X GET "http://localhost:8000/api/ticker/AAPL/latest"
```

### Example Request

```
GET /api/ticker/AAPL/latest
```

---

## Response

### Success Response (200 OK)

When results are found, the endpoint returns a `TickerResultResponse` object containing all CSV-derived columns.

**Response Schema:**

```json
{
  "date": "string",
  "ticker": "string",
  "region": "string",
  "index_name": "string",
  "company_name": "string",
  "primary_instrument": "string | null",
  "name_chinese": "string | null",
  "report_analysis": "string | null",
  "report_analysis_table": "string | null",
  "info": "string | null",
  "technical_analysis": "string | null",
  "transcript_analysis": "string | null",
  "company_doc_analysis": "string | null",
  "other_doc_analysis": "string | null",
  "news_details": "string | null",
  "news_summary": "string | null",
  "fundamental_score_analysis": "string | null",
  "fundamental_score": "number | null",
  "analyst_sentiment_score_analysis": "string | null",
  "analyst_sentiment_score": "number | null",
  "valuation_score_analysis": "string | null",
  "valuation_score": "number | null",
  "catalysts_score_analysis": "string | null",
  "catalyst_score": "number | null",
  "technical_score_analysis": "string | null",
  "technical_score": "number | null",
  "confidence_level_analysis": "string | null",
  "confidence_level": "number | null",
  "trade_strategy": "string | null",
  "direction": "string | null",
  "condition": "string | null",
  "entry": "number | null",
  "take_profit": "number | null",
  "stop_loss": "number | null",
  "investment_thesis": "string | null",
  "total_score": "number | null",
  "price": "number | null",
  "target_price": "number | null",
  "upside": "number | null",
  "image_url": "string | null"
}
```

### Example Success Response

```json
{
  "date": "2025-03-10 14:30:00",
  "ticker": "AAPL",
  "region": "US",
  "index_name": "NASDAQ",
  "company_name": "Apple Inc.",
  "primary_instrument": "AAPL.OQ",
  "name_chinese": null,
  "report_analysis": "Apple reported strong Q4 earnings...",
  "report_analysis_table": "Revenue: $89.5B, EPS: $1.29...",
  "info": "Market leader in consumer electronics...",
  "technical_analysis": "Stock is trading above key support at $185...",
  "transcript_analysis": "Management highlighted strong iPhone sales...",
  "company_doc_analysis": "10-K filing shows healthy balance sheet...",
  "other_doc_analysis": null,
  "news_details": "Recent news about product launches...",
  "news_summary": "Positive sentiment around new product line...",
  "fundamental_score_analysis": "Strong fundamentals with high ROE...",
  "fundamental_score": 8.5,
  "analyst_sentiment_score_analysis": "Analysts are bullish...",
  "analyst_sentiment_score": 7.8,
  "valuation_score_analysis": "Trading at reasonable valuation...",
  "valuation_score": 7.2,
  "catalysts_score_analysis": "Upcoming product launches...",
  "catalyst_score": 8.0,
  "technical_score_analysis": "Strong technical setup...",
  "technical_score": 7.5,
  "confidence_level_analysis": "High confidence in analysis...",
  "confidence_level": 0.85,
  "trade_strategy": "Buy pullbacks toward $185 support level",
  "direction": "Long",
  "condition": "Buy",
  "entry": 186.4,
  "take_profit": 205.0,
  "stop_loss": 177.0,
  "investment_thesis": "Apple's ecosystem strength and innovation...",
  "total_score": 7.8,
  "price": null,
  "target_price": null,
  "upside": null,
  "image_url": "images/AAPL.OQ_2025-03-10.png"
}
```

### No Results Found (200 OK)

When no results are found for the given ticker, the endpoint returns `null` with a 200 OK status code.

**Response:**

```json
null
```

### Error Responses

#### 500 Internal Server Error

Occurs when there's a database error or other server-side issue.

```json
{
  "detail": "Failed to retrieve ticker result: [error message]"
}
```

---

## Field Descriptions

### Basic Information

| Field                | Type   | Description                                    |
|----------------------|--------|------------------------------------------------|
| `date`               | string | Date of the analysis                           |
| `ticker`             | string | Ticker symbol                                  |
| `region`             | string | Geographic region (e.g., "US", "HK")           |
| `index_name`         | string | Stock exchange or index name                   |
| `company_name`       | string | Full company name                              |
| `primary_instrument` | string | Primary instrument identifier (RIC format)     |
| `name_chinese`       | string | Chinese name of the company (if applicable)    |

### Analysis Fields

| Field                    | Type   | Description                                    |
|--------------------------|--------|------------------------------------------------|
| `report_analysis`        | string | Analysis of research reports                   |
| `report_analysis_table`  | string | Tabular data from report analysis              |
| `info`                   | string | General information about the company          |
| `technical_analysis`     | string | Technical/chart analysis                       |
| `transcript_analysis`    | string | Analysis of earnings call transcripts          |
| `company_doc_analysis`   | string | Analysis of company documents (10-K, etc.)     |
| `other_doc_analysis`     | string | Analysis of other relevant documents           |

### News Fields

| Field          | Type   | Description                          |
|----------------|--------|--------------------------------------|
| `news_details` | string | Detailed news information            |
| `news_summary` | string | Summary of relevant news             |

### Score Fields

| Field                              | Type   | Description                                    |
|------------------------------------|--------|------------------------------------------------|
| `fundamental_score_analysis`       | string | Analysis explaining the fundamental score      |
| `fundamental_score`                | number | Fundamental analysis score (0-10)              |
| `analyst_sentiment_score_analysis` | string | Analysis explaining the analyst sentiment      |
| `analyst_sentiment_score`          | number | Analyst sentiment score (0-10)                 |
| `valuation_score_analysis`         | string | Analysis explaining the valuation score        |
| `valuation_score`                  | number | Valuation score (0-10)                         |
| `catalysts_score_analysis`         | string | Analysis explaining the catalysts score        |
| `catalyst_score`                   | number | Catalysts score (0-10)                         |
| `technical_score_analysis`         | string | Analysis explaining the technical score        |
| `technical_score`                  | number | Technical analysis score (0-10)                |
| `confidence_level_analysis`        | string | Analysis explaining the confidence level       |
| `confidence_level`                 | number | Confidence level (0-1)                         |
| `total_score`                      | number | Overall composite score (0-10)                 |

### Trading Fields

| Field            | Type   | Description                                    |
|------------------|--------|------------------------------------------------|
| `trade_strategy` | string | Recommended trading strategy                   |
| `direction`      | string | Trade direction ("Long", "Short", or "Neutral")|
| `condition`      | string | Trading condition ("Buy", "Sell", "Hold")      |
| `entry`          | number | Recommended entry price                        |
| `take_profit`    | number | Take profit target price                       |
| `stop_loss`      | number | Stop loss price                                |

### Summary Fields

| Field              | Type   | Description                          |
|--------------------|--------|--------------------------------------|
| `investment_thesis`| string | Overall investment thesis            |

### Price Fields (Placeholder)

| Field         | Type   | Description                                    |
|---------------|--------|------------------------------------------------|
| `price`       | number | Current price (currently returns `null`)       |
| `target_price`| number | Target price (currently returns `null`)        |
| `upside`      | number | Upside percentage (currently returns `null`)   |

**Note:** The price-related fields (`price`, `target_price`, `upside`) currently return `null` as placeholder values. These will be populated in future updates when price data becomes available.

### Media Fields

| Field       | Type   | Description                                    |
|-------------|--------|------------------------------------------------|
| `image_url` | string | S3 URL to the per-ticker analysis image        |

---

## Implementation Details

### Database Query

The endpoint queries the `JobResults` table and:
1. Filters by the provided `ticker` symbol
2. Orders results by `id` in descending order (most recent first)
3. Returns the first (latest) result

### Excluded Fields

The following fields are **not** included in the response:
- `id` - Internal database ID
- `job_id` - Job identifier
- `api_key` - API key used for the analysis
- `ric` - RIC identifier (explicitly excluded per requirements)

---

## Usage Examples

### cURL

```bash
# Basic request
curl -X GET "http://localhost:8000/api/ticker/AAPL/latest"

# With pretty-printed JSON output (requires jq)
curl -X GET "http://localhost:8000/api/ticker/AAPL/latest" | jq

# Example with different ticker
curl -X GET "http://localhost:8000/api/ticker/MSFT/latest"
```

### Python

```python
import requests

url = "http://localhost:8000/api/ticker/AAPL/latest"
response = requests.get(url)

if response.status_code == 200:
    data = response.json()
    if data is None:
        print("No results found for this ticker")
    else:
        print(f"Total Score: {data['total_score']}")
        print(f"Direction: {data['direction']}")
        print(f"Entry: {data['entry']}")
```

### JavaScript/TypeScript

```javascript
const response = await fetch('http://localhost:8000/api/ticker/AAPL/latest');
const data = await response.json();

if (data === null) {
  console.log('No results found for this ticker');
} else {
  console.log(`Total Score: ${data.total_score}`);
  console.log(`Direction: ${data.direction}`);
  console.log(`Entry: ${data.entry}`);
}
```

---

## Notes

1. **Latest Result**: The endpoint returns the most recent analysis based on the database `id` field. This ensures you always get the newest available analysis for a ticker.

2. **Null Handling**: When no results are found, the endpoint returns `null` with a 200 OK status code, treating it as a valid state rather than an error condition.

3. **Optional Fields**: Most fields in the response are optional and may be `null` if not available for a particular analysis.

4. **Price Data**: The `price`, `target_price`, and `upside` fields are currently placeholders returning `null`. These will be populated in future API versions.

5. **No Authentication**: This endpoint does not require authentication at the moment.

---

## Related Endpoints

- `GET /api/status/{job_id}` - Check analysis job status
- `GET /api/report/{job_id}` - Get generated PDF report
- `POST /api/analyze` - Start a new analysis job

---

## Changelog

- **2025-03-10**: Initial endpoint implementation
  - Added support for retrieving latest ticker results
  - Excluded `ric` field from response
  - Added placeholder fields for price data


  # Orion Insight API Documentation for Frontend

## 1. General Information

This guide provides everything you need to interact with the Tickers, Screener, and Watchlists APIs.

### 1.1 Authentication

All API endpoints are protected and require a specific two-header authentication scheme on **every request**. You must provide both your Access Token and your Refresh Token.

**Required Headers:**

1.  `Authorization`: The Bearer token containing your short-lived access token.
    *   **Format**: `Bearer <your_access_token>`

2.  `X-Refresh-Token`: A custom header containing your long-lived refresh token.
    *   **Format**: `<your_refresh_token>`

**Example Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
X-Refresh-Token: def50200f21782218a49104c97926b77...
```

If your access token is expired, the API will return a `401 Unauthorized` status. Your application should then use the refresh token to request a new set of tokens from the authentication endpoint.

### 1.2 Data Units & Currency

This is critical for correctly displaying financial data:

*   **Currency**: All monetary values in API requests and responses are in **United States Dollars (USD)**, even for stocks listed on foreign exchanges like the HKEX.
*   **Scale**: Key financial metrics are returned in **millions**.
    *   `market_cap_usd`
    *   `adtv_3m_usd` (Average Daily Trading Volume)
    *   **Example**: A `market_cap_usd` value of `2100000` in the API response represents **$2,100,000,000,000 USD** (2.1 Trillion USD). You will need to multiply the API value by `1,000,000` to get the full number.

### 1.3 Paginated Response Structure

Endpoints that return a list of items use a standardized paginated response object.

**Structure:**
```json
{
  "data": [ /* Array of result objects (e.g., Ticker objects) */ ],
  "total": 125,
  "page": 1,
  "size": 50,
  "pages": 3,
  "has_next": true,
  "has_prev": false
}
```

*   `data`: `Array` - The list of items for the current page.
*   `total`: `Integer` - The total number of items matching the query across all pages.
*   `page`: `Integer` - The current page number you are on (1-indexed).
*   `size`: `Integer` - The number of items you requested per page.
*   `pages`: `Integer` - The total number of pages available.
*   `has_next`: `Boolean` - `true` if there is another page of results after this one.
*   `has_prev`: `Boolean` - `true` if there is a previous page.

---

## 2. Response Object Schemas

These are the detailed structures of the data objects returned by the API.

### 2.1 Ticker Object

This object contains comprehensive information about a single stock ticker, including data from the latest analysis report.

| Field                   | Type          | Description                                                                 |
| :---------------------- | :------------ | :-------------------------------------------------------------------------- |
| **Core Identifiers**    |               |                                                                             |
| `ticker`                | `String`      | The common stock ticker symbol (e.g., "AAPL").                              |
| `ric`                   | `String`      | The Refinitiv Instrument Code (e.g., "AAPL.O").                             |
| `company_name`          | `String`      | The legal name of the company (e.g., "Apple Inc").                          |
| `chinese_name`          | `String`      | The Chinese name of the company.                                            |
| `display_name`          | `String`      | The common name used for display purposes.                                  |
| `primary_instrument`    | `String`      | The RIC of the primary instrument.                                          |
| **Classification**      |               |                                                                             |
| `sector`                | `String`      | The GICS sector (e.g., "Information Technology").                           |
| `subsector`             | `String`      | The GICS industry group (e.g., "Technology Hardware, Storage & Peripherals"). |
| `industry`              | `String`      | The GICS industry (e.g., "Technology Hardware, Storage & Peripherals").     |
| `subindustry`           | `String`      | The GICS sub-industry (e.g., "Technology Hardware, Storage & Peripherals"). |
| `themes`                | `Array[String]` | A list of associated investment themes (e.g., ["Semiconductor & Chips"]). |
| `asset_category`        | `String`      | The type of asset (e.g., "ORDINARY SHARE"). Can be `null`.                  |
| **Exchange Information**|               |                                                                             |
| `exchange`              | `String`      | The full name of the stock exchange (e.g., "NASDAQ").                       |
| `exchange_country_code` | `String`      | The two-letter country code of the exchange (e.g., "US", "HK"). Can be `null`. |
| `quotation_currency`    | `String`      | The currency the stock is quoted in on its exchange (e.g., "USD", "HKD").   |
| `cf_currency`           | `String`      | The company's reporting currency. Can be `null`.                           |
| **Flags**               |               |                                                                             |
| `is_primary_listing`    | `Boolean`     | `true` if this is the company's primary listing globally.                   |
| `primary_quote_flag`    | `Boolean`     | `true` if this is the primary quote.                                        |
| **Financial Metrics**   |               |                                                                             |
| `market_cap_usd`        | `Number`      | Market capitalization in **millions USD**. Can be `null`.                     |
| `adtv_3m_usd`           | `Number`      | 3-month average daily trading volume in **millions USD**. Can be `null`.      |
| `pe_ltm`                | `Number`      | Price-to-Earnings ratio for the last twelve months. Can be `null`.            |
| `pe_fy1`                | `Number`      | Forward P/E ratio for the next fiscal year. Can be `null`.                  |
| `pe_fy2`                | `Number`      | Forward P/E ratio for the fiscal year after next. Can be `null`.              |
| `target_price_cons_pct` | `Number`      | Analyst consensus target price upside as a percentage (e.g., `15.5` for +15.5%). Can be `null`. |
| `last_price`            | `Number`      | The last closing price of the stock. Can be `null`.                           |
| **Recommendation & Report Data** |      | These fields are from the latest analysis. They will be `null` if no report exists. |
| `last_report_date`      | `String`      | The date of the latest analysis report (e.g., "2025-11-17"). Can be `null`. |
| `trade_recommended`     | `Boolean`     | `true` if a "Long" or "Short" direction is specified in the report. Can be `null`. |
| `total_score`           | `Number`      | The overall recommendation score from 1-10. Can be `null`.                  |
| `fundamental_score`     | `Number`      | The fundamental analysis score from 1-10. Can be `null`.                    |
| `analyst_sentiment_score`| `Number`     | The analyst sentiment score from 1-10. Can be `null`.                       |
| `valuation_score`       | `Number`      | The valuation score from 1-10. Can be `null`.                               |
| `catalyst_score`        | `Number`      | The catalyst score from 1-10. Can be `null`.                                |
| `technical_score`       | `Number`      | The technical analysis score from 1-10. Can be `null`.                      |
| **Timestamps**          |               |                                                                             |
| `metrics_updated_at`    | `String`      | ISO 8601 timestamp (UTC) of when financial metrics were last updated.       |
| `created_at`            | `String`      | ISO 8601 timestamp (UTC) of when the record was created.                    |
| `updated_at`            | `String`      | ISO 8601 timestamp (UTC) of when the record was last updated.               |

### 2.2 Watchlist Object

This object represents a user's personal watchlist.

| Field           | Type                     | Description                                                                      |
| :-------------- | :----------------------- | :------------------------------------------------------------------------------- |
| `id`            | `Integer`                | The unique identifier for the watchlist.                                         |
| `user_id`       | `String`                 | The ID of the user who owns the watchlist.                                       |
| `name`          | `String`                 | The name of the watchlist (e.g., "My Favorite Tech Stocks").                     |
| `tickers`       | `Array[String]`          | A simple list of the ticker symbols in this watchlist (e.g., `["AAPL", "MSFT"]`). |
| `tickers_details` | `Array[Ticker Object]` | An array of complete **Ticker Objects** for every ticker in the watchlist.       |
| `created_at`    | `String`                 | ISO 8601 timestamp (UTC) of when the watchlist was created.                      |
| `updated_at`    | `String`                 | ISO 8601 timestamp (UTC) of when the watchlist was last updated.                 |

---

## 3. Screener Endpoint

The screener is a powerful endpoint to find specific tickers that match a combination of financial, descriptive, and recommendation-based criteria.

*   **Method**: `GET`
*   **Endpoint**: `/orion-insight/screener/query`
*   **Returns**: A [Paginated Response](#13-paginated-response-structure) containing enriched [Ticker Objects](#21-ticker-object) that match the filters.

### Filtering and Sorting Parameters
This endpoint accepts pagination (`page`, `size`) and sorting (`sort_by`, `sort_order`) parameters, plus the comprehensive set of filters below. All filters are combined with **AND** logic, while multiple values for the same list-based filter (e.g., `sectors`) are combined with **OR** logic.

| Parameter                  | Type          | Description                                                                 |
| :------------------------- | :------------ | :-------------------------------------------------------------------------- |
| **Core Identifiers**       |               |                                                                             |
| `tickers`                  | `List[String]`| Filter by a specific list of ticker symbols (e.g., `?tickers=AAPL&tickers=MSFT`). |
| `ric`                      | `String`      | Filter by a single, exact Refinitiv Instrument Code.                        |
| `company_name`             | `String`      | Filter by company name (case-insensitive, partial match).                   |
| `chinese_name`             | `String`      | Filter by Chinese name (case-insensitive, partial match).                   |
| `display_name`             | `String`      | Filter by display name (case-insensitive, partial match).                   |
| `primary_instrument`       | `String`      | Filter by the primary instrument RIC.                                       |
| **Classification**         |               | (Multiple values for the same parameter use OR logic)                       |
| `sectors`                  | `List[String]`| Filter by one or more GICS sectors.                                         |
| `subsectors`               | `List[String]`| Filter by one or more GICS subsectors.                                      |
| `industry`                 | `List[String]`| Filter by one or more GICS industries.                                      |
| `subindustry`              | `List[String]`| Filter by one or more GICS sub-industries.                                  |
| `themes`                   | `List[String]`| Filter by one or more investment themes.                                    |
| `asset_categories`         | `List[String]`| Filter by one or more asset categories (e.g., "ORDINARY SHARE").            |
| **Exchange Information**   |               | (Multiple values for the same parameter use OR logic)                       |
| `exchanges`                | `List[String]`| Filter by one or more exchange names (e.g., "NASDAQ").                      |
| `exchange_country_codes`   | `List[String]`| Filter by exchange country code (e.g., "US", "HK").                         |
| `quotation_currencies`     | `List[String]`| Filter by the stock's quotation currency (e.g., "USD", "HKD").              |
| `cf_currencies`            | `List[String]`| Filter by the company's reporting currency.                                 |
| **Flags**                  |               |                                                                             |
| `is_primary_listing`       | `Boolean`     | Filter for tickers that are (`true`) or are not (`false`) a primary listing. |
| `primary_quote_flag`       | `Boolean`     | Filter for tickers that are (`true`) or are not (`false`) a primary quote.   |
| **Market Cap (USD)**       |               | **Note**: Values are in **millions**. `100000` = $100 Billion.              |
| `min_market_cap`           | `Number`      | Minimum market capitalization in millions USD.                              |
| `max_market_cap`           | `Number`      | Maximum market capitalization in millions USD.                              |
| **Trading Volume (USD)**   |               | **Note**: Values are in **millions**.                                       |
| `min_adtv_3m`              | `Number`      | Minimum 3-month avg daily trading volume in millions USD.                   |
| `max_adtv_3m`              | `Number`      | Maximum 3-month avg daily trading volume in millions USD.                   |
| **Valuation Metrics**      |               |                                                                             |
| `min_pe_ltm`               | `Number`      | Minimum Price-to-Earnings ratio (Last Twelve Months).                       |
| `max_pe_ltm`               | `Number`      | Maximum Price-to-Earnings ratio (Last Twelve Months).                       |
| `min_pe_fy1`               | `Number`      | Minimum forward P/E ratio for the next fiscal year.                         |
| `max_pe_fy1`               | `Number`      | Maximum forward P/E ratio for the next fiscal year.                         |
| `min_pe_fy2`               | `Number`      | Minimum forward P/E ratio for the fiscal year after next.                   |
| `max_pe_fy2`               | `Number`      | Maximum forward P/E ratio for the fiscal year after next.                   |
| **Price & Upside**         |               |                                                                             |
| `min_last_price`           | `Number`      | Minimum last closing price.                                                 |
| `max_last_price`           | `Number`      | Maximum last closing price.                                                 |
| `min_target_price_cons_pct`| `Number`      | Minimum analyst consensus target price upside (as a percentage).            |
| `max_target_price_cons_pct`| `Number`      | Maximum analyst consensus target price upside (as a percentage).            |
| **Recommendation Filters** |               | (These query the latest analysis report for each ticker)                    |
| `recommendation_bias`      | `List[String]`| Filter by trade direction (case-insensitive, OR logic for multiple values). Allowed: `Long`, `Short`, `Neutral`. |
| `min_total_score`          | `Number`      | Minimum overall recommendation score (1-10).                                |
| `max_total_score`          | `Number`      | Maximum overall recommendation score (1-10).                                |
| `min_fundamental_score`    | `Number`      | Minimum/maximum fundamental score (1-10).                                   |
| `max_fundamental_score`    | `Number`      |                                                                             |
| `min_analyst_sentiment_score` | `Number`   | Minimum/maximum analyst sentiment score (1-10).                             |
| `max_analyst_sentiment_score` | `Number`   |                                                                             |
| `min_valuation_score`      | `Number`      | Minimum/maximum valuation score (1-10).                                     |
| `max_valuation_score`      | `Number`      |                                                                             |
| `min_catalysts_score`      | `Number`      | Minimum/maximum catalyst score (1-10).                                      |
| `max_catalysts_score`      | `Number`      |                                                                             |
| `min_technical_score`      | `Number`      | Minimum/maximum technical score (1-10).                                     |
| `max_technical_score`      | `Number`      |                                                                             |
| `max_analysis_age_days`    | `Integer`     | Filters for reports created within the last N days (e.g., `7` for the last week). |

---

## 4. Field Values API

### Endpoint
`GET /orion-insight/screener/field-values`

### Description
Returns all available distinct values for string-based filter fields. This endpoint is essential for building filter UIs with dropdown options, as it provides all valid values that can be used in filter requests.

### Response
```json
{
  "sectors": ["Information Technology", "Health Care", "Financials", ...],
  "subsectors": ["Software & Services", "Technology Hardware & Equipment", ...],
  "industries": ["Software", "IT Services", "Biotechnology", ...],
  "subindustries": ["Application Software", "Systems Software", ...],
  "themes": ["Artificial Intelligence", "Electric Vehicles", "Cybersecurity", ...],
  "asset_categories": ["ORDINARY SHARE", "AMERICAN DEPOSITORY RECEIPT", ...],
  "exchanges": ["New York Stock Exchange", "Nasdaq Stock Market", ...],
  "exchange_country_codes": ["US", "HK"],
  "quotation_currencies": ["USD", "HKD", "CNY"],
  "cf_currencies": ["USD", "HKD", "CNY"],
  "recommendation_biases": ["Long", "Short", "Neutral"]
}
```

---

## 5. Watchlists Endpoints

These endpoints are for managing a user's personal watchlists.

### 5.1 Create a Watchlist

Creates a new watchlist.

*   **Method**: `POST`
*   **Endpoint**: `/orion-insight/watchlists/`
*   **Returns**: A `201 Created` status with the newly created [Watchlist Object](#22-watchlist-object) in the response body.

**Request Body:**
```json
{
  "name": "My Cloud Stocks",
  "tickers": ["MSFT", "GOOGL", "AMZN"]
}
```

### 5.2 Get User's Watchlists

Retrieves all watchlists for the logged-in user.

*   **Method**: `GET`
*   **Endpoint**: `/orion-insight/watchlists/`
*   **Returns**: A [Paginated Response](#13-paginated-response-structure) containing [Watchlist Objects](#22-watchlist-object).

### 5.3 Get a Specific Watchlist

Retrieves a single watchlist by its unique ID.

*   **Method**: `GET`
*   **Endpoint**: `/orion-insight/watchlists/{watchlist_id}`
*   **Returns**: A `200 OK` status with a single [Watchlist Object](#22-watchlist-object).
*   **Errors**: Returns `404 Not Found` if the ID doesn't exist or doesn't belong to the user.

### 5.4 Update a Watchlist

Updates a watchlist's name and/or its list of tickers.

*   **Method**: `PATCH`
*   **Endpoint**: `/orion-insight/watchlists/{watchlist_id}`
*   **Returns**: A `200 OK` status with the fully updated [Watchlist Object](#22-watchlist-object).

**Request Body (Partial):**
You only need to send the fields you want to change.
*   To rename: `{"name": "New Name"}`
*   To replace tickers: `{"tickers": ["TSLA", "NIO"]}`
    > **Important**: Providing the `tickers` array will **completely replace** the existing list of tickers with the new one.

*   **Errors**: Returns `404 Not Found` if the ID doesn't exist or doesn't belong to the user.

### 5.5 Delete a Watchlist

Permanently deletes a watchlist. This action cannot be undone.

*   **Method**: `DELETE`
*   **Endpoint**: `/orion-insight/watchlists/{watchlist_id}`
*   **Returns**: A `204 No Content` status on success, with an empty response body.
*   **Errors**: Returns `404 Not Found` if the ID doesn't exist or doesn't belong to the user.

