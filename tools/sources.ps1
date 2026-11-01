# CryWall — shared content rules and source parsers.
# Used by server.ps1 (local PC version) and tools/build-catalog.ps1 (website catalog).
# The host script must define:  function Get-Html([string]$url) { ... }

# ---------- copyright safety ----------
# The site is meant to be published, so we keep away from brand-owned characters/franchises
# (games, anime series, comics, films, celebrities). Generic art, photos and scenery stay.

# Wallhaven: excluded from every search.
$WhExclude = ' -"video games" -"video game characters" -"video game art" -"anime girls" -"anime boys" -"Cyberpunk 2077" -Marvel -"DC Comics" -"Star Wars" -Pokemon -celebrity'

# Women / girls are kept out of every category except "Anime Karakter" (user request:
# people who want them find them there). That category only takes ORIGINAL characters.
$GirlExclude = ' -women -"women outdoors" -model -girl -brunette -blonde -redhead -"long hair" -"short hair" -"looking at viewer" -bikini -"anime girl"'
$CharacterQuery = '+"original characters" +"anime girls"'
# Warrior / knight / samurai art often comes from big game & film series: keep those out too,
# so the character categories only show ORIGINAL (fan-free, studio-free) designs.
$FranchiseMore = ' -"God of War" -"Assassin''s Creed" -Destiny -Overwatch -"League of Legends" -"World of Warcraft" -Diablo -Skyrim -"The Elder Scrolls" -"Final Fantasy" -"For Honor" -"Ghost of Tsushima" -Sekiro -Bloodborne -"Dark Souls" -"Elden Ring" -"The Witcher" -Warhammer -Halo -"The Lord of the Rings" -"Game of Thrones" -Batman -"Spider-Man" -"Mortal Kombat" -"Monster Hunter"'
# Builds the exclusion part of a Wallhaven query for a search text.
function Get-WhFilter([string]$q) {
    if ($q -like '*original characters*') { return ($WhExclude -replace ' -"anime girls"', '') + $FranchiseMore }
    return $WhExclude + $GirlExclude + $FranchiseMore
}
# Live wallpaper titles about girls/women stay out of the (scenery) live categories.
$GirlTitle = [regex]::new('(?i)\b(girl|girls|woman|women|lady|waifu|maid|princess|goddess|she|her)\b')

# MotionBGs: only these generic tags are used (no franchise tags).
$MbTags = @('anime-nature', 'japan', 'torii', 'samurai', 'fantasy', 'dragon', 'knight', 'space', 'astronaut', 'black-hole',
    'rain', 'night', 'sunset', 'forest', 'winter', 'snow', 'water', 'mountain', 'autumn-leaves', 'landscape', 'nature',
    'car', 'sports-cars', 'animal', 'cat', 'dog', 'dark', 'cyberpunk', 'technology', 'purple', 'blue', 'red', 'white')

# Titles / searches containing these are dropped.
$Blocked = [regex]::new('(?i)\b(' + (@(
    'demon slayer', 'kimetsu', 'tanjiro', 'nezuko', 'muzan', 'naruto', 'sasuke', 'itachi', 'kakashi', 'hinata', 'boruto', 'jujutsu', 'gojo', 'sukuna', 'itadori', 'toji', 'megumi', 'maki zenin',
    'one piece', 'luffy', 'zoro', 'dragon ?ball', 'goku', 'vegeta', 'gohan', 'chainsaw', 'makima', 'denji', 'solo leveling', 'jin-?woo', 'bleach', 'ichigo', 'nelliel', 'rukia',
    'attack on titan', 'eren', 'levi', 'mikasa', 'frieren', 'blue lock', 'hero academia', 'deku', 'hololive', 'berserk', 'tokyo ghoul', 'kaneki', 'princess connect', 'miku', 'hatsune',
    'league of legends', 'arcane', 'jinx', 'ahri', 'akali', 'seraphine', 'star guardian', 'k/?da', 'genshin', 'nahida', 'arlecchino', 'ningguang', 'raiden', 'honkai', 'stelle', 'fu hua', 'kiana', 'wuthering', 'zzz', 'zenless',
    'cyberpunk 2077', 'edgerunners', 'arknights', 'punishing', 'pok.mon', 'pikachu', 'blue archive', 'valorant', 'jett', 'overwatch', 'nikke', 'fortnite', 'warcraft', 'minecraft', 'touhou', 'nier', '2b', 'call of duty',
    'marvel', 'spider-?man', 'miles morales', 'dc comics', 'iron ?man', 'deadpool', 'superman', 'batman', 'joker', 'star wars', 'darth', 'mandalorian', 'jedi', 'rick and morty', 'wednesday',
    'squid game', 'gravity falls', 'spongebob', 'lotr', 'lord of the rings', 'gandalf', 'jojo', 'one punch', 'saitama', 'gundam', 'hunter x hunter', 'killua', 'sword art', 'kirito', 'asuna', 'death note', 'zero two',
    're:? ?zero', 'your name', 'black clover', 'baki', 'mob psycho', 'dandadan', 'spy x family', 'anya', 'mushoku', 'ghibli', 'totoro', 'tokyo revengers', 'fairy tail', 'haikyuu?', 'made in abyss', 'wind breaker',
    'witcher', 'geralt', 'warhammer', 'hollow knight', 'need for speed', 'persona', 'azur lane', 'resident evil', 'final fantasy', 'cloud strife', 'zelda', 'mario', 'nintendo', 'elden ring', 'gta', 'dota',
    'god of war', 'kratos', 'fallout', 'tsushima', 'assassin', 'roblox', 'red dead', 'rdr', 'wukong', 'warframe', 'helldivers', 'mortal kombat', 'girls.? frontline', 'sonic', 'skyrim', 'sekiro', 'pubg', 'brawl stars',
    'last of us', 'csgo', 'cs2', 'counter-?strike', 'hunt showdown', 'sea of thieves', 'walking dead', 'umamusume', 'fnaf', 'five nights', 'ruiner', 'titanfall', 'hello kitty', 'mass effect', 'master chief',
    'kabaneri', 'mumei', 'ghost in the shell', 'motoko', 'marin kitagawa', 'stella sora', 'otoha', 'hsin', 'dong xuelian', 'velina', 'alice kuonji', 'uncle panda', 'disney', 'pixar', 'harry potter', 'evangelion',
    'messi', 'ronaldo', 'neymar', 'mbappe', 'barbie', 'transformers', 'godzilla', 'kaiju', 'shrek', 'minion', 'abi toads', 'st ar-15', 'ar-15'
) -join '|') + ')\b')
function Test-Blocked([string]$text) { return [bool]($text -and $Blocked.IsMatch($text)) }

# Live wallpaper lists. $cat = "<source>:<category>"
#   mb = MotionBGs (anime, games, trending; empty category = newest)
#   mx = Mixkit (real nature / stock footage)
function Get-LiveList([string]$cat, [int]$page) {
    if ($cat -notmatch '^(mb|mx):([a-z0-9\-]{0,40})$') { throw 'bad_cat' }
    $src = $Matches[1]; $key = $Matches[2]
    $seen = @{}; $items = @()

    if ($src -eq 'mb') {
        if ($key -notin $MbTags) { throw 'bad_cat' }
        $url = 'https://motionbgs.com/' + $(if ($key) { "tag:$key/" } else { '' }) + $(if ($page -gt 1) { "$page/" } else { '' })
        $html = Get-Html $url
        $rx = '<a title="([^"]+?) live wallpaper" href=/([a-z0-9\-]+)>(?:(?!<a title=).)*?/media/(\d+)/[a-z0-9\-]+\.(\d+x\d+)\.jpg'
        $found = [regex]::Matches($html, $rx, 'Singleline')
        $raw = $found.Count
        foreach ($m in $found) {
            $n = $m.Groups[3].Value; $slug = $m.Groups[2].Value; $res = $m.Groups[4].Value
            if ($seen[$n]) { continue }; $seen[$n] = 1
            if ((Test-Blocked $m.Groups[1].Value) -or (Test-Blocked ($slug -replace '-', ' '))) { continue }
            if ($GirlTitle.IsMatch($m.Groups[1].Value)) { continue }
            $items += @{
                id      = "mb-$n"
                title   = [Net.WebUtility]::HtmlDecode($m.Groups[1].Value)
                thumb   = "https://motionbgs.com/i/c/960x540/media/$n/$slug.$res.jpg"
                preview = "https://motionbgs.com/media/$n/$slug.960x540.mp4"
                hd      = "https://motionbgs.com/media/$n/$slug.960x540.mp4"
                uhd     = ($res -eq '3840x2160')
                page    = "https://motionbgs.com/$slug"
                source  = 'MotionBGs'
            }
        }
    } else {
        if (-not $key) { throw 'bad_cat' }
        $url = "https://mixkit.co/free-stock-video/$key/"
        if ($page -gt 1) { $url += "?page=$page" }
        $html = Get-Html $url
        $rx = 'assets\.mixkit\.co/videos/(\d+)/\1-thumb-360-0\.jpg"\s+class="item-grid-video-player__thumb"\s+alt="([^"]*)"'
        $found = [regex]::Matches($html, $rx)
        $raw = $found.Count
        foreach ($m in $found) {
            $n = $m.Groups[1].Value
            if ($seen[$n]) { continue }; $seen[$n] = 1
            $items += @{
                id      = "mx-$n"
                title   = [Net.WebUtility]::HtmlDecode($m.Groups[2].Value)
                thumb   = "https://assets.mixkit.co/videos/$n/$n-thumb-720-0.jpg"
                preview = "https://assets.mixkit.co/videos/$n/$n-360.mp4"
                hd      = "https://assets.mixkit.co/videos/$n/$n-720.mp4"
                uhd     = $false
                page    = "https://mixkit.co/free-stock-video/$key/"
                source  = 'Mixkit'
            }
        }
    }
    return @{ data = $items; page = $page; more = ($raw -gt 0 -and $page -lt 40) }
}
