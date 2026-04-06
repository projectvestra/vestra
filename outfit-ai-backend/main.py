import os, json, uuid
from fastapi import FastAPI, Form
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import re

load_dotenv()
app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

@app.get("/health")
def health():
    return {"status": "ok", "model": "claude-sonnet-4-6"}

def extract_json(text):
    # Try to find JSON object or array
    json_match = re.search(r'(\{.*\}|\[.*\])', text, re.DOTALL)
    if json_match:
        try:
            return json.loads(json_match.group(1))
        except json.JSONDecodeError:
            pass
    return None

@app.post("/recommend")
async def recommend(
    occasion: str = Form("casual"),
    temperature_c: float = Form(22.0),
    wardrobe_json: str = Form(...),
    locked_top_id: str = Form(None),
    locked_bottom_id: str = Form(None),
    locked_shoes_id: str = Form(None),
):
    from anthropic import Anthropic
    client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
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

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1500,
        system="You are a professional fashion stylist. Generate outfit recommendations using ONLY items from the wardrobe. Return valid JSON only.",
        messages=[{"role": "user", "content": f"""
WARDROBE:
{wardrobe_text}

CONTEXT: occasion={occasion}, temperature={temperature_c}C

Generate 10 outfit combinations ranked by style score.
Return JSON array:
[{{"top": {{"id":"..."}}, "bottom": {{"id":"..."}}, "shoes": {{"id":"..."}}, "score": {{"total": 8.5, "color": 8.0, "coherence": 9.0, "occasion": 8.5}}}}]
Only the JSON array, nothing else."""}]
    )

    try:
        raw = response.content[0].text.strip()
        outfits_raw = extract_json(raw)
        if not outfits_raw:
            return {"outfits": [], "error": "Invalid JSON response"}
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
        return {"outfits": outfits, "source": "ai"}
    except Exception as e:
        return {"outfits": [], "error": str(e)}

@app.post("/weekly-plan")
async def weekly_plan(
    wardrobe_json: str = Form(...),
    occasions_json: str = Form(...),
):
    from anthropic import Anthropic
    client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
    wardrobe = json.loads(wardrobe_json)
    occasions = json.loads(occasions_json)
    items_by_id = {item['id']: item for item in wardrobe}

    wardrobe_text = "\n".join([
        f"ID:{i['id']} | {i.get('category','?')} | color:{i.get('colorName',i.get('color','?'))}"
        for i in wardrobe[:40]
    ])
    occasions_text = "\n".join([f"{day}: {occ}" for day, occ in occasions.items()])

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=2000,
        system="You are a professional fashion stylist. Create a 7-day outfit plan with NO REPEATED combinations. Each day must have a DIFFERENT outfit. Match formality to occasion. Return valid JSON only.",
        messages=[{"role": "user", "content": f"""
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
Only the JSON object."""}]
    )

    try:
        raw = response.content[0].text.strip()
        plan_data = extract_json(raw)
        if not plan_data:
            return {"plan": {}, "error": "Invalid JSON response"}
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
        return {"plan": result, "source": "ai", "model": "claude-sonnet-4-6"}
    except Exception as e:
        return {"plan": {}, "error": str(e)}

def _cat(item):
    cat = (item.get('category') or item.get('name') or '').lower()
    if any(x in cat for x in ['shirt','top','t-shirt','blouse','jacket','hoodie','sweater','coat']): return 'top'
    if any(x in cat for x in ['pant','jean','trouser','chino','short','skirt']): return 'bottom'
    if any(x in cat for x in ['shoe','sneaker','boot','sandal','loafer']): return 'shoes'
    return 'other'