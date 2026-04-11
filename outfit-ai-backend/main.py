import os, json, uuid
from urllib.parse import quote
from urllib.request import Request as UrlRequest, urlopen
from fastapi import FastAPI, Form, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import re

load_dotenv()
app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

MARKETPLACE_PRODUCTS = [
    {
        "id": "myntra-shirt-001",
        "name": "Navy Slim Fit Cotton Shirt",
        "brand": "Roadster",
        "category": "Shirts",
        "price": 1299,
        "currency": "INR",
        "imageUrl": "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80",
        "productUrl": "https://www.myntra.com/shirts/roadster/roadster-men-navy-slim-fit-casual-shirt/",
        "description": "Breathable casual shirt for daily wear",
        "source": "myntra",
    },
    {
        "id": "ajio-pants-001",
        "name": "Black Tapered Chinos",
        "brand": "NETPLAY",
        "category": "Pants",
        "price": 1499,
        "currency": "INR",
        "imageUrl": "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=800&q=80",
        "productUrl": "https://www.ajio.com/netplay-men-tapered-fit-trousers/p/",
        "description": "Stretch chinos with tapered silhouette",
        "source": "ajio",
    },
    {
        "id": "amazon-shoes-001",
        "name": "White Lifestyle Sneakers",
        "brand": "Puma",
        "category": "Shoes",
        "price": 2999,
        "currency": "INR",
        "imageUrl": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
        "productUrl": "https://www.amazon.in/s?k=puma+white+lifestyle+sneakers",
        "description": "Everyday sneakers with lightweight cushioning",
        "source": "amazon",
    },
    {
        "id": "flipkart-acc-001",
        "name": "Classic Brown Leather Belt",
        "brand": "Allen Solly",
        "category": "Accessories",
        "price": 899,
        "currency": "INR",
        "imageUrl": "https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=800&q=80",
        "productUrl": "https://www.flipkart.com/search?q=allen+solly+brown+leather+belt",
        "description": "Genuine leather belt with metal buckle",
        "source": "flipkart",
    },
    {
        "id": "myntra-shirt-002",
        "name": "White Relaxed Linen Shirt",
        "brand": "H&M",
        "category": "Shirts",
        "price": 1799,
        "currency": "INR",
        "imageUrl": "https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=800&q=80",
        "productUrl": "https://www.myntra.com/shirts/h%26m/hm-men-white-relaxed-fit-linen-shirt/",
        "description": "Soft linen shirt for summer outfits",
        "source": "myntra",
    },
]

REMOTE_PRODUCTS_URL = "https://fakestoreapi.com/products"


def _normalize_marketplace_category(raw_category: str) -> str:
    category = (raw_category or "").lower()
    if any(token in category for token in ["shirt", "top", "men's clothing", "women's clothing"]):
        return "Shirts"
    if any(token in category for token in ["pant", "jean", "trouser"]):
        return "Pants"
    if any(token in category for token in ["shoe", "sneaker", "footwear"]):
        return "Shoes"
    return "Accessories"


def _to_search_product_url(name: str) -> str:
    query = quote(name or "fashion product")
    return f"https://www.amazon.in/s?k={query}"


def _map_remote_product(item: dict) -> dict:
    product_name = item.get("title") or item.get("name") or "Untitled product"
    return {
        "id": f"remote-{item.get('id', uuid.uuid4().hex)}",
        "name": product_name,
        "brand": item.get("brand") or "Fashion Store",
        "category": _normalize_marketplace_category(item.get("category", "")),
        "price": float(item.get("price") or 0),
        "currency": "USD",
        "imageUrl": item.get("image") or item.get("imageUrl") or "",
        "productUrl": item.get("url") or item.get("productUrl") or _to_search_product_url(product_name),
        "description": item.get("description") or "Fashion product",
        "source": "fakestoreapi",
    }


def _fetch_remote_marketplace_products() -> list[dict]:
    try:
        with urlopen(REMOTE_PRODUCTS_URL, timeout=8) as response:
            payload = json.loads(response.read().decode("utf-8"))
        if not isinstance(payload, list):
            return []
        return [_map_remote_product(item) for item in payload if isinstance(item, dict)]
    except Exception:
        return []

@app.get("/health")
def health():
    return {"status": "ok", "model": os.getenv("GEMINI_MODEL", "gemini-1.5-flash")}

@app.get("/marketplace/products")
def get_marketplace_products(
    category: str | None = Query(default=None),
    q: str | None = Query(default=None),
    limit: int = Query(default=20, ge=1, le=100),
    sort: str = Query(default="popular"),
):
    remote_products = _fetch_remote_marketplace_products()
    products = remote_products if remote_products else MARKETPLACE_PRODUCTS

    if category and category.lower() != "all":
        products = [
            product for product in products
            if product.get("category", "").lower() == category.lower()
        ]

    if q:
        query_text = q.lower().strip()
        products = [
            product for product in products
            if query_text in product.get("name", "").lower()
            or query_text in product.get("brand", "").lower()
            or query_text in product.get("description", "").lower()
            or query_text in product.get("category", "").lower()
        ]

    if sort == "price_asc":
        products = sorted(products, key=lambda product: float(product.get("price", 0)))
    elif sort == "price_desc":
        products = sorted(products, key=lambda product: float(product.get("price", 0)), reverse=True)

    return {
        "products": products[:limit],
        "total": len(products),
        "source": "remote" if remote_products else "local-fallback",
    }

def extract_json(text):
    # Try to find JSON object or array
    json_match = re.search(r'(\{.*\}|\[.*\])', text, re.DOTALL)
    if json_match:
        try:
            return json.loads(json_match.group(1))
        except json.JSONDecodeError:
            pass
    return None


def _get_gemini_api_key() -> str:
    return os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY") or ""


def _call_gemini(prompt: str, system_instruction: str = "", max_output_tokens: int = 1024, temperature: float = 0.3) -> str:
    api_key = _get_gemini_api_key()
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY missing")

    model = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"

    payload = {
        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": temperature,
            "maxOutputTokens": max_output_tokens,
        },
    }

    if system_instruction:
        payload["system_instruction"] = {"parts": [{"text": system_instruction}]}

    req = UrlRequest(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    with urlopen(req, timeout=25) as response:
        raw = response.read().decode("utf-8")
        parsed = json.loads(raw)

    candidates = parsed.get("candidates") or []
    if not candidates:
        raise RuntimeError(f"Gemini returned no candidates: {parsed}")

    parts = candidates[0].get("content", {}).get("parts", [])
    text = "".join([part.get("text", "") for part in parts if isinstance(part, dict)]).strip()
    if not text:
        raise RuntimeError(f"Gemini returned empty text: {parsed}")
    return text


def _fallback_score(top: dict, bottom: dict, shoes: dict, occasion: str = "casual") -> dict:
    base = 7.0
    if occasion in {"office", "smart-casual"}:
        base += 0.4
    if occasion in {"party", "date night"}:
        base += 0.3
    return {
        "total": round(min(9.3, base), 2),
        "color": round(min(9.2, base + 0.2), 2),
        "coherence": round(min(9.1, base + 0.1), 2),
        "occasion": round(min(9.0, base + 0.15), 2),
    }


def _fallback_recommendations(wardrobe: list[dict], occasion: str, limit: int = 10) -> list[dict]:
    tops = [i for i in wardrobe if _cat(i) == 'top']
    bottoms = [i for i in wardrobe if _cat(i) == 'bottom']
    shoes = [i for i in wardrobe if _cat(i) == 'shoes']

    outfits: list[dict] = []
    for top in tops:
        for bottom in bottoms:
            for shoe in shoes:
                outfits.append({
                    "top": top,
                    "bottom": bottom,
                    "shoes": shoe,
                    "score": _fallback_score(top, bottom, shoe, occasion),
                })
                if len(outfits) >= limit:
                    return outfits
    return outfits


def _fallback_weekly_plan(wardrobe: list[dict], occasions: dict) -> dict:
    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    outfits = _fallback_recommendations(wardrobe, "casual", limit=40)
    if not outfits:
        return {}

    plan = {}
    for idx, day in enumerate(days):
        if day not in occasions:
            continue
        outfit = outfits[idx % len(outfits)]
        occ = occasions.get(day, "casual")
        plan[day] = {
            "top": outfit["top"],
            "bottom": outfit["bottom"],
            "shoes": outfit["shoes"],
            "score": _fallback_score(outfit["top"], outfit["bottom"], outfit["shoes"], occ),
        }
    return plan

@app.post("/recommend")
async def recommend(
    occasion: str = Form("casual"),
    temperature_c: float = Form(22.0),
    wardrobe_json: str = Form(...),
    locked_top_id: str = Form(None),
    locked_bottom_id: str = Form(None),
    locked_shoes_id: str = Form(None),
):
    wardrobe = json.loads(wardrobe_json)
    items_by_id = {item['id']: item for item in wardrobe}

    tops    = [i for i in wardrobe if _cat(i) == 'top']
    bottoms = [i for i in wardrobe if _cat(i) == 'bottom']
    shoes   = [i for i in wardrobe if _cat(i) == 'shoes']

    if locked_top_id:    tops    = [items_by_id[locked_top_id]]    if locked_top_id    in items_by_id else tops
    if locked_bottom_id: bottoms = [items_by_id[locked_bottom_id]] if locked_bottom_id in items_by_id else bottoms
    if locked_shoes_id:  shoes   = [items_by_id[locked_shoes_id]]  if locked_shoes_id  in items_by_id else shoes

    wardrobe_text = "\n".join([
        f"ID:{i['id']} | {i.get('category','?')} | color:{i.get('color','?')} | colorName:{i.get('colorName','?')}"
        for i in wardrobe[:40]
    ])

    try:
        raw = _call_gemini(
            prompt=f"""
WARDROBE:
{wardrobe_text}

CONTEXT: occasion={occasion}, temperature={temperature_c}C

Generate 10 outfit combinations ranked by style score.
Return JSON array:
[{{"top": {{"id":"..."}}, "bottom": {{"id":"..."}}, "shoes": {{"id":"..."}}, "score": {{"total": 8.5, "color": 8.0, "coherence": 9.0, "occasion": 8.5}}}}]
Only the JSON array, nothing else.
""",
            system_instruction="You are a professional fashion stylist. Generate outfit recommendations using ONLY items from the wardrobe. Return valid JSON only.",
            max_output_tokens=1500,
            temperature=0.2,
        )
        outfits_raw = extract_json(raw)
        if not outfits_raw or not isinstance(outfits_raw, list):
            raise RuntimeError("Invalid AI JSON response")
        # Hydrate IDs back to full items
        outfits = []
        for o in outfits_raw:
            top_id    = o.get('top',    {}).get('id')
            bottom_id = o.get('bottom', {}).get('id')
            shoes_id  = o.get('shoes',  {}).get('id')
            if top_id in items_by_id and bottom_id in items_by_id and shoes_id in items_by_id:
                outfits.append({
                    "top":    items_by_id[top_id],
                    "bottom": items_by_id[bottom_id],
                    "shoes":  items_by_id[shoes_id],
                    "score":  o.get('score', {"total":7,"color":7,"coherence":7,"occasion":7}),
                })
        if outfits:
            return {"outfits": outfits, "source": "ai"}
        raise RuntimeError("AI returned no valid outfits")
    except Exception as e:
        fallback = _fallback_recommendations(wardrobe, occasion, limit=10)
        return {"outfits": fallback, "source": "local-fallback", "error": str(e)}

@app.post("/weekly-plan")
async def weekly_plan(
    wardrobe_json: str = Form(...),
    occasions_json: str = Form(...),
):
    wardrobe = json.loads(wardrobe_json)
    occasions = json.loads(occasions_json)
    items_by_id = {item['id']: item for item in wardrobe}

    wardrobe_text = "\n".join([
        f"ID:{i['id']} | {i.get('category','?')} | color:{i.get('colorName',i.get('color','?'))}"
        for i in wardrobe[:40]
    ])
    occasions_text = "\n".join([f"{day}: {occ}" for day, occ in occasions.items()])

    try:
        raw = _call_gemini(
            prompt=f"""
WARDROBE ITEMS:
{wardrobe_text}

OCCASIONS:
{occasions_text}

Create a 7-day plan. Each day MUST use different items from the previous days.
Return JSON:
{{
  "Monday":    {{"top_id": "...", "bottom_id": "...", "shoes_id": "...", "score": {{"total": 8.2, "color": 8.0, "coherence": 8.5, "occasion": 8.0}}}},
  "Tuesday":   {{"top_id": "...", "bottom_id": "...", "shoes_id": "...", "score": {{"total": 7.8, "color": 7.5, "coherence": 8.0, "occasion": 8.0}}}},
  "Wednesday": {{"top_id": "...", "bottom_id": "...", "shoes_id": "...", "score": {{"total": 8.5, "color": 9.0, "coherence": 8.0, "occasion": 8.5}}}},
  "Thursday":  {{"top_id": "...", "bottom_id": "...", "shoes_id": "...", "score": {{"total": 7.5, "color": 7.0, "coherence": 8.0, "occasion": 7.5}}}},
  "Friday":    {{"top_id": "...", "bottom_id": "...", "shoes_id": "...", "score": {{"total": 8.8, "color": 9.0, "coherence": 9.0, "occasion": 8.5}}}},
  "Saturday":  {{"top_id": "...", "bottom_id": "...", "shoes_id": "...", "score": {{"total": 8.0, "color": 8.5, "coherence": 7.5, "occasion": 8.0}}}},
  "Sunday":    {{"top_id": "...", "bottom_id": "...", "shoes_id": "...", "score": {{"total": 7.2, "color": 7.0, "coherence": 7.5, "occasion": 7.0}}}}
}}
Only the JSON object.
""",
                        system_instruction="You are a professional fashion stylist. Create a 7-day outfit plan with NO REPEATED combinations. Each day must have a DIFFERENT outfit. Match formality to occasion. Return valid JSON only.",
                        max_output_tokens=2000,
                        temperature=0.2,
        )
        plan_data = extract_json(raw)
        if not plan_data or not isinstance(plan_data, dict):
            raise RuntimeError("Invalid AI JSON response")
        result = {}
        for day, combo in plan_data.items():
            top_id    = combo.get('top_id')
            bottom_id = combo.get('bottom_id')
            shoes_id  = combo.get('shoes_id')
            if top_id in items_by_id and bottom_id in items_by_id and shoes_id in items_by_id:
                result[day] = {
                    "top":    items_by_id[top_id],
                    "bottom": items_by_id[bottom_id],
                    "shoes":  items_by_id[shoes_id],
                    "score":  combo.get('score', {"total":7,"color":7,"coherence":7,"occasion":7}),
                }
        if result:
            return {"plan": result, "source": "ai", "model": os.getenv("GEMINI_MODEL", "gemini-1.5-flash")}
        raise RuntimeError("AI returned no valid weekly plan")
    except Exception as e:
        fallback = _fallback_weekly_plan(wardrobe, occasions)
        return {"plan": fallback, "source": "local-fallback", "error": str(e)}


@app.post("/profile-summary")
async def profile_summary(request: Request):
    payload = await request.json()
    styles = payload.get("styles") or []
    colors = payload.get("colors") or []
    body_type = payload.get("bodyType") or ""
    pronouns = payload.get("pronouns") or ""

    if not isinstance(styles, list):
        styles = [styles]
    if not isinstance(colors, list):
        colors = [colors]

    style_text = ", ".join([str(style) for style in styles[:3] if str(style).strip()]) or "clean style"
    color_text = ", ".join([str(color) for color in colors[:3] if str(color).strip()]) or "neutral colors"
    fit_text = str(body_type).strip() or "balanced fit"
    pronouns_text = str(pronouns).strip() or "they/them"

    try:
        summary = _call_gemini(
            prompt=f"""
Style tags: {style_text}
Body type: {fit_text}
Color choices: {color_text}
Pronouns: {pronouns_text}

Write a short profile summary in 1-2 sentences, max 24 words total.
""",
            system_instruction="You write very short fashion profile summaries. Mention pronouns naturally once and describe style, body shape, and color preference in 1-2 short sentences, no labels.",
            max_output_tokens=80,
            temperature=0.2,
        )
        summary = re.sub(r"\s+", " ", summary)
        return {"summary": summary, "source": "ai", "model": os.getenv("GEMINI_MODEL", "gemini-1.5-flash")}
    except Exception as e:
        summary = f"{pronouns_text} prefer {style_text.lower()} looks, with a {fit_text.lower()} shape profile and {color_text.lower()} color choices."
        return {"summary": summary, "source": "local-fallback", "error": str(e)}

def _cat(item):
    cat = (item.get('category') or item.get('name') or '').lower()
    if any(x in cat for x in ['shirt','top','t-shirt','blouse','jacket','hoodie','sweater','coat']): return 'top'
    if any(x in cat for x in ['pant','jean','trouser','chino','short','skirt']): return 'bottom'
    if any(x in cat for x in ['shoe','sneaker','boot','sandal','loafer']): return 'shoes'
    return 'other'