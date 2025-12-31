import React, { useState, useRef, useMemo, useEffect } from 'react';
import { 
  generateVillageDetails, 
  generateNPCPortrait, 
  generateVillageMap, 
  generateMerchantVoice,
  generateVillageGossip,
  generatePOI
} from './services/geminiService';
import { VillageData, DetailedNPC, Relationship, PointOfInterest, Business, SettlementRelation, Festival } from './types';
import { 
  Scroll, RefreshCw, Users, Flame, Waves, Store, Printer, Skull, ArrowRight, UserCircle,
  EyeOff, MessageSquareQuote, BookOpen, Pencil, MapPin, Heart, Swords, Minus, Package,
  ShoppingBag, Sparkles, Search, Fingerprint, Edit2, Check, X, CloudFog, Wind, Wand2,
  Map as MapIcon, Compass, FileText, Shield, Activity, Sword, Axe, Zap, Castle, Crown,
  Frown, Meh, Volume2, Coins, Tag, Newspaper, BarChart3, Info, Scale, CircleDot, Ghost,
  User as UserIcon, Mountain, Ghost as GhostIcon, Binoculars, AlertCircle,
  Briefcase, FileDigit, Dices, CloudRain, Sun, ThermometerSnowflake, HeartCrack, Goal,
  ZapOff, Calendar, MapPinned, Moon, SunMedium, UserSearch, Tent, Ghost as MonsterIcon,
  HandHelping, MessageCircle, Save, FolderOpen, Download, Settings2, Plus, Trash2,
  Bug, Zap as Spark, Target, Footprints, Droplets, Bone, Wind as Gust, Globe,
  CalendarDays, Sprout, Leaf, Snowflake, Star
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

// --- Constants: 1d100 Tables ---

const PC_HOOKS = [
  "Inherited a derelict shack from a distant relative who died under mysterious circumstances.",
  "Searching for a sibling who was last seen entering the village tavern a month ago.",
  "Hired as an escort for a merchant who vanished the moment you reached the village outskirts.",
  "Born here; your family has farmed this soil for six generations, but the crop just failed.",
  "On the run from a debt collector in a distant city; this place seemed isolated enough to hide.",
  "A local NPC owes you a blood debt from a war fought years ago.",
  "You carry a letter for the local priest, but the seal is broken and the parchment is damp.",
  "You were left at the local orphanage as a babe and have finally returned to find your true name.",
  "An ancient map you found in a crypt points directly to the center of this village.",
  "You are a distant cousin of the village elder, come to attend a family funeral.",
  "A dream led you here; the village landmark from your nightmares is real.",
  "You are a disgraced soldier looking for work as a mercenary for the local businesses.",
  "Sent by a guild to investigate reports of a rare mineral found in the nearby river.",
  "Looking for the thief who stole your master's spellbook; the trail ends at the village gates.",
  "You have a recurring infection that only the local herbalist is rumored to be able to cure.",
  "Searching for the legendary 'Black Smith' of the village to repair a shattered heirloom.",
  "The village is on the path of your pilgrimage to a distant mountain shrine.",
  "You were part of a caravan that was raided nearby; you are the sole survivor.",
  "An old friend sent you a frantic message: 'Do not come to the village.' You came anyway.",
  "You are a bounty hunter trailing a dangerous chaotic mage through the region.",
  "Returning to reclaim the family home which was seized by the local lord for unpaid taxes.",
  "A local shop owner is your only contact for selling 'difficult' goods.",
  "You were cursed by a witch and told the only cure lies in the heart of this village.",
  "The local tavern is famous for a brew you've been tasked to sample for a noble.",
  "Looking for a quiet place to retire from a life of violence, but the atmosphere feels off.",
  "Your mentor's grave is here, and you've come to pay your respects.",
  "You are a tax collector sent from the capital to find out why the village is late.",
  "A fortune teller told you that you would meet your future spouse in this village.",
  "The village's 'Dark Secret' is something you've heard rumors of since childhood.",
  "Looking for an apprentice who ran away to join a cult rumored to operate nearby.",
  "You are a travelling bard looking for new stories in isolated places.",
  "Hired to deliver a chest of 'special' seeds to the local farrier.",
  "You believe your father's murderer is hiding among the local residents.",
  "A mysterious benefactor paid for your travel here and told you to 'wait for the signal.'",
  "You are an architect sent to survey the village landmarks for a historical society.",
  "Looking for a specific book in the local archive that supposedly contains the secret to a lost vault.",
  "You are a half-elf looking for the elven parent who abandoned you here.",
  "Sent to inspect the village's defenses against a rising tide of undead in the region.",
  "You have a blood-link to the village's founder and feel a strange pull toward the land.",
  "Searching for the truth about a 'ghost ship' seen on the river near the village.",
  "You were once a guard here and have returned to find out what happened to your old squad.",
  "An NPC is your former lover; things ended badly, but you need their help now.",
  "Looking for a rare herb that only grows in the shadow of the local landmarks.",
  "You are a scholar studying the unique demographics of this isolated community.",
  "You have a bounty on your head and heard the local law is 'flexible.'",
  "A merchant you trust told you that the village's blacksmith is selling enchanted steel.",
  "Your family crest is carved into one of the old stones in the village center.",
  "Sent to buy a specific type of livestock only bred in this valley.",
  "You are a monk looking for a quiet place to meditate, but the village's morale is disturbing.",
  "Searching for the components of a ritual that requires 'soil from a place of deep secrets.'",
  "You found a locket with a portrait of a local resident and want to return it.",
  "You are a spy for a rival lord, sent to assess the village's loyalty.",
  "Looking for work as a laborer; the harvest season is approaching.",
  "You were told a legendary hero lives here in hiding.",
  "Searching for your lost child; the last person to see them was a local shop owner.",
  "You carry a curse that makes you feel at home only in dark, damp places like this.",
  "Hired by a wizard to capture a 'living shadow' rumored to haunt the village outskirts.",
  "Looking for the source of a strange disease that started in this village and is spreading.",
  "You are a cartographer making a map of the Shadowdark and this is your last stop.",
  "A local resident owes you their life and you've come to collect a favor.",
  "Searching for the entrance to a 'sunken city' that is supposedly under the river.",
  "You are a former criminal looking for an honest life, but your past has followed you.",
  "Hired to bring a message of war to the village elder.",
  "You have a map to a treasure hidden within the village's own walls.",
  "Looking for a priest who can perform an exorcism on a possessed item you carry.",
  "Searching for the 'White Raven' – a legendary NPC only found in this village.",
  "You were born during an eclipse here and believe your destiny is tied to the site.",
  "Hired to investigate a series of mysterious disappearances at a nearby Point of Interest.",
  "You are a chef looking for a rare spice that grows near the riverbank.",
  "Searching for the tomb of a saint rumored to be hidden under a local landmark.",
  "You have a debt to a local business that you've finally come to repay.",
  "Looking for a safe place to stash a dangerous artifact.",
  "You are an artist wanting to capture the 'beauty of the gloom' in this village.",
  "Searching for a specific halfling who stole your family's favorite silver spoon.",
  "You are a hunter following the trail of a beast that has been terrorizing the region.",
  "Sent to deliver a crate of expensive wine to a local shop owner for a private party.",
  "You have a premonition that the village is about to be destroyed.",
  "Looking for a teacher who can help you master a strange power you'discover.",
  "You are a halfling looking for a community that won't judge your 'special' talents.",
  "Searching for the 'Heart of the Village' – a gemstone rumored to keep the river flowing.",
  "You are a merchant looking to open a new trade route through this isolated valley.",
  "Hired to find a missing noble who was last seen entering the village.",
  "Looking for a priest who can cleanse your soul of a dark deed.",
  "Searching for a specific dwarf who knows the location of a lost mine.",
  "You are a traveller who got lost in the fog and stumbled upon the village.",
  "Hired to investigate why the local river has turned a strange shade of black.",
  "Looking for a quiet place to write your memoirs.",
  "Searching for a local legend who can tell you the history of the landmarks.",
  "You are a mercenary captain looking for new recruits in a desperate place.",
  "Hired to find out who is responsible for the 'Current Events' in the village.",
  "You are a pilgrim who has lost their way and needs shelter.",
  "Looking for a doctor who can heal a wound that won't close.",
  "Searching for a local shop owner who sold you a defective 'magic' item.",
  "You have a strange birthmark that matches the carvings on the village gates.",
  "Hired to deliver a 'message in a bottle' that you found in the river.",
  "You are a survivor of a plague looking for a new home.",
  "Searching for the truth about your parents' mysterious deaths in this village.",
  "You have been 'summoned' by a local NPC through a dream or vision.",
  "Hired to protect the village from an imminent threat mentioned in a main quest.",
  "You are here because you have nowhere else left to go."
];

const VILLAGE_EVENTS = [
  "A local child has gone missing, and their favorite toy was found near the river.",
  "The river has suddenly turned an oily black, and the fish are dying.",
  "A travelling circus has arrived, but their animals look starved and their clowns never smile.",
  "A strange fog has rolled in and hasn't lifted for three days; people are hearing voices in it.",
  "The local tavern has run out of ale, and the patrons are becoming violent.",
  "A group of fanatical cultists has set up a shrine at one of the landmarks.",
  "A local resident has been found dead, with their heart neatly removed.",
  "The village gates have been found smashed open from the *inside*.",
  "A rare eclipse is occurring, and the animals are acting in a frenzy.",
  "A mysterious merchant is selling 'dream-inducing' herbs that have the village addicted.",
  "The river level has dropped drastically, revealing ancient ruins beneath the surface.",
  "A pack of dire wolves has been howling outside the village walls every night.",
  "A local shop owner has suddenly become incredibly wealthy and refuses to say why.",
  "The village elder has fallen into a coma, and their skin is turning to stone.",
  "A fire has broken out in the warehouse, and the town's winter supplies are burning.",
  "A group of bedraggled refugees has arrived, claiming a 'shadow' is following them.",
  "The bells of the local church are ringing on their own at midnight.",
  "A local resident claims to have found a 'door to another world' in their cellar.",
  "The village's morale has plummeted after a beloved figure was accused of a crime.",
  "A strange 'black rain' is falling, and it's causing the plants to wither and die.",
  "A bounty hunter has arrived, looking for someone among the residents.",
  "The local farrier's horses have all died in their sleep, with no marks on them.",
  "A travelling bard is singing a song that contains secrets only the GM should know.",
  "A local landmark has suddenly started glowing with a sickly green light.",
  "The village well has dried up, and the residents are fighting over the last drops of water.",
  "A group of soldiers has arrived to 'tax' the village, but they look like bandits.",
  "A local shop owner has been found talking to a reflection that isn't their own.",
  "The village's 'Dark Secret' is being whispered about in the streets.",
  "A strange 'metal bird' has crashed into the river, and it's emitting a humming sound.",
  "A local resident has suddenly started speaking a language no one understands.",
  "A 'weeping' statue has been found at one of the landmarks; the tears are blood.",
  "The village's grain supply has been infested with a strange, glowing fungus.",
  "A group of 'holy' men has arrived, but they are demanding sacrifices.",
  "A local resident has been seen entering a Point of Interest and hasn't returned.",
  "The village gates have been sealed by a mysterious order of mages.",
  "A local shop owner has been accused of being a 'chaotic agent.'",
  "A strange 'clockwork' device has been found in the village square, and it's ticking.",
  "The river has started flowing backwards, carrying strange debris with it.",
  "A local resident has been found 'turned to shadow,' standing perfectly still.",
  "A group of miners has returned from the nearby mountains, looking terrified.",
  "The village's morale has suddenly turned 'Defiant' against an unseen threat.",
  "A mysterious 'plague' is causing people to lose their memories of the last year.",
  "A local shop owner has been found murdered, with a strange symbol carved into their forehead.",
  "The village's demographics are shifting as 'others' arrive in large numbers.",
  "A strange 'blue light' is seen in the sky every night, hovering over the village.",
  "A local resident claims to be the 'reincarnation' of the village founder.",
  "The village's landmarks are being vandalized with 'chaotic' symbols.",
  "A group of 'mercenaries' has arrived to protect the village, but they are causing trouble.",
  "A local shop owner has been found 'fused' to their own merchandise.",
  "The river is producing a constant, low-frequency hum that is driving people mad.",
  "A 'giant' has been seen in the distance, slowly walking toward the village.",
  "A local resident has been found 'empty' – alive but with no personality or soul.",
  "The village's 'Dark Secret' is starting to manifest physically in the environment.",
  "A group of 'halflings' has arrived, looking for a place to hide a dangerous item.",
  "A mysterious 'doorway' has appeared in the middle of the village square.",
  "A local shop owner is selling 'lucky' charms that actually bring bad luck.",
  "The river has frozen solid, even though it's the middle of summer.",
  "A 'ghost ship' has docked at the village pier, but no one is on board.",
  "A local resident has been seen 'floating' a few inches off the ground.",
  "The village's morale has turned 'Fearful' after a series of strange occurrences.",
  "A group of 'dwarves' has arrived, claiming the village is built on top of their mine.",
  "A local shop owner has been found 'inside out,' yet still alive.",
  "The village's landmarks are starting to 'move' or change position.",
  "A mysterious 'black box' has been found at the riverbank, and it's emitting heat.",
  "A local resident has been found 'transformed' into an animal.",
  "The village's grain supply is being eaten by a swarm of 'shadow insects.'",
  "A group of 'elves' has arrived, looking for a 'stolen' artifact.",
  "A local shop owner has been found 'living' in their own shadow.",
  "The river is producing 'bubbles' that contain images of the future.",
  "A 'giant eye' has opened in the sky, watching the village.",
  "A local resident has been seen 'talking' to the wind.",
  "The village's 'Dark Secret' is being broadcast through a magical resonance.",
  "A group of 'cultists' has taken over one of the businesses.",
  "A mysterious 'white wolf' has been seen leading people into the gloom.",
  "A local resident has been found 'turned to gold,' but it's cold to the touch.",
  "The village's morale has turned 'Resentful' against the current leadership.",
  "A group of 'travellers' has arrived, but they have no shadows.",
  "A local shop owner is selling 'items from the future.'",
  "The river is flowing with 'liquid light' instead of water.",
  "A 'giant hand' has emerged from the ground, holding a local resident.",
  "A local resident has been found 'merged' with a landmark.",
  "The village's 'Dark Secret' has been revealed to everyone.",
  "A group of 'bandits' has laid siege to the village.",
  "A mysterious 'portal' has opened in the tavern cellar.",
  "A local shop owner is actually a 'dragon' in disguise.",
  "The river is producing a 'fog' that makes people invisible.",
  "A 'giant snake' has been seen swimming in the river.",
  "A local resident has been found 'turned to glass.'",
  "The village's morale has turned 'Apathetic' as the darkness grows.",
  "A group of 'heroes' has arrived, but they look like they've already failed.",
  "A mysterious 'voice' is coming from the village well.",
  "A local shop owner is selling 'soul-trapping' mirrors.",
  "The river is producing 'gold coins' that disappear after an hour.",
  "A 'giant bird' has built a nest on top of a landmark.",
  "A local resident has been seen 'walking on water.'",
  "The village's 'Dark Secret' is about to consume the entire town.",
  "A group of 'demons' has been summoned by accident.",
  "A mysterious 'clock' is counting down to an unknown event.",
  "A local shop owner is selling 'the meaning of life.'",
  "The village has been 'shifted' into another dimension."
];

// --- Encounter Tables: Day and Night ---

const ENCOUNTERS_DAY_INSIDE = [
  { icon: <UserSearch size={16} />, who: "Pickpocket", attitude: "Hostile", text: "A nimble-fingered youth attempts to lift a pouch from a PC's belt." },
  { icon: <MessageSquareQuote size={16} />, who: "Street Preacher", attitude: "Bizarre", text: "A wild-eyed man screams about the 'Great Shadow' coming to consume the sun." },
  { icon: <Activity size={16} />, who: "Stray Hound", attitude: "Friendly", text: "A scrawny, mangy dog follows the party, hoping for a scrap of dried meat." },
  { icon: <ShoppingBag size={16} />, who: "Suspicious Merchant", attitude: "Neutral", text: "A hooded figure offers 'genuine' elven silk at a price too good to be true." },
  { icon: <Shield size={16} />, who: "Guard Patrol", attitude: "Wary", text: "Two guards in rusted chainmail demand to know the party's business in this quarter." },
  { icon: <Users size={16} />, who: "Orphan Beggar", attitude: "Fearful", text: "A grime-covered child asks for a single copper piece to buy a crust of bread." },
  { icon: <Swords size={16} />, who: "Drunken Brawl", attitude: "Hostile", text: "Two laborers spill out of a tavern, swinging heavy clubs at anyone nearby." },
  { icon: <Activity size={16} />, who: "Runaway Cart", attitude: "Neutral", text: "A panicked mule pulls a cart of cabbages through the street; make a DEX save!" },
  { icon: <Wand2 size={16} />, who: "Hedge Witch", attitude: "Bizarre", text: "An old woman offers to read the party's fortune in a bowl of brackish water." },
  { icon: <Package size={16} />, who: "Mysterious Package", attitude: "Neutral", text: "A small, ticking box is left on a doorstep just as the party passes." },
  { icon: <CloudRain size={16} />, who: "Sudden Deluge", attitude: "Neutral", text: "The sky opens up, drenching the street and reducing visibility to a few paces." },
  { icon: <Meh size={16} />, who: "Town Drunk", attitude: "Neutral", text: "A man smelling of sour ale stumbles into a PC, muttering apologies." },
  { icon: <MessageCircle size={16} />, who: "Gossiping Elders", attitude: "Neutral", text: "Three old men on a bench stop talking and stare intently at the party." },
  { icon: <Skull size={16} />, who: "Public Stocks", attitude: "Neutral", text: "A local criminal is being pelted with rotten fruit; they beg the PCs for water." },
  { icon: <Tag size={16} />, who: "Snake Oil Vendor", attitude: "Friendly", text: "A charismatic woman sells 'Troll Blood' tonic that is just dyed vinegar." },
  { icon: <Crown size={16} />, who: "Minor Noble", attitude: "Neutral", text: "A local official passes by in a sedan chair, escorted by four surly guards." },
  { icon: <GhostIcon size={16} />, who: "Black Cat", attitude: "Bizarre", text: "A cat with one white paw crosses the path and hisses at the party's shadows." },
  { icon: <Flame size={16} />, who: "Chimney Fire", attitude: "Neutral", text: "Smoke billows from a nearby roof; residents scramble with buckets of sand." },
  { icon: <Activity size={16} />, who: "Rat Swarm", attitude: "Hostile", text: "A dozen rats surge from a sewer grate, biting at the party's boots." },
  { icon: <Newspaper size={16} />, who: "Local Messenger", attitude: "Friendly", text: "A boy runs past, shouting about the latest 'Current Event' in the village." }
];

const ENCOUNTERS_NIGHT_INSIDE = [
  { icon: <UserSearch size={16} />, who: "Roof Stalker", attitude: "Hostile", text: "A silhouette is seen leaping between rooftops, watching the party." },
  { icon: <Ghost size={16} />, who: "Muffled Scream", attitude: "Wary", text: "A cry for help echoes from a narrow, unlit alleyway." },
  { icon: <Users size={16} />, who: "Hooded Cultists", attitude: "Hostile", text: "Six figures in gray robes carry a heavy, blood-stained sack." },
  { icon: <ZapOff size={16} />, who: "Sleeping Sentry", attitude: "Neutral", text: "A guard is fast asleep against a crate, their torch long extinguished." },
  { icon: <Activity size={16} />, who: "Giant Rat", attitude: "Hostile", text: "A massive rat with glowing red eyes gnaws on a discarded bone." },
  { icon: <Wind size={16} />, who: "Slamming Shutter", attitude: "Bizarre", text: "A window shutter slams shut violently as the party passes beneath it." },
  { icon: <MonsterIcon size={16} />, who: "Distant Howl", attitude: "Hostile", text: "A howl that sounds far too large for a dog echoes through the empty streets." },
  { icon: <Spark size={16} />, who: "Green Light", attitude: "Bizarre", text: "A sickly green glow flickers through the cracks of a cellar door." },
  { icon: <ThermometerSnowflake size={16} />, who: "Shivering Beggar", attitude: "Fearful", text: "A man huddles in a doorway, his breath visible in the freezing night air." },
  { icon: <MessageCircle size={16} />, who: "Secret Meeting", attitude: "Wary", text: "Two figures whisper urgently behind a rain barrel; they bolt if seen." },
  { icon: <CloudFog size={16} />, who: "Choking Fog", attitude: "Neutral", text: "A thick, yellow fog rolls in, smelling of sulfur and damp earth." },
  { icon: <GhostIcon size={16} />, who: "Spectral Child", attitude: "Bizarre", text: "A translucent girl chases a ghostly ball across the road and vanishes." },
  { icon: <Flame size={16} />, who: "Night Watch", attitude: "Wary", text: "A patrol of four guards with lanterns demands the party's 'night pass'." },
  { icon: <Fingerprint size={16} />, who: "Lock-picker", attitude: "Hostile", text: "A thief is caught red-handed trying to jemmy open a shop door." },
  { icon: <Activity size={16} />, who: "Scratching Wall", attitude: "Bizarre", text: "The sound of frantic scratching comes from inside a seemingly empty house." },
  { icon: <Gust size={16} />, who: "Foul Wind", attitude: "Neutral", text: "A sudden blast of cold air carries the unmistakable stench of the grave." },
  { icon: <EyeOff size={16} />, who: "Glowing Eyes", attitude: "Bizarre", text: "Multiple pairs of reflective eyes watch the party from a dark stable." },
  { icon: <Meh size={16} />, who: "Lost Reveler", attitude: "Neutral", text: "A nobleman's son, far too drunk, is wandering the wrong part of town." },
  { icon: <Castle size={16} />, who: "Phantom Door", attitude: "Bizarre", text: "A door painted blood-red appears on a wall that was bare yesterday." },
  { icon: <Ghost size={16} />, who: "Moving Shadow", attitude: "Hostile", text: "A PC's shadow seems to lag behind their movements for a few seconds." }
];

const ENCOUNTERS_MONSTERS = [
  { icon: <MonsterIcon size={16} />, who: "Giant Centipede", attitude: "Hostile", text: "A segmented horror with venomous pincers lunges from a sewer grate." },
  { icon: <GhostIcon size={16} />, who: "Shadow", attitude: "Hostile", text: "A patch of darkness detaches from a wall and reaches for your throat." },
  { icon: <Skull size={16} />, who: "Ghoul", attitude: "Hostile", text: "A rubbery-skinned undead with long claws tries to drag you into an alley." },
  { icon: <Activity size={16} />, who: "Giant Rat", attitude: "Neutral", text: "A rat the size of a dog is chewing on a discarded boot and eyes you warily." },
  { icon: <Bug size={16} />, who: "Swarm of Beetles", attitude: "Hostile", text: "Thousands of clicking insects boil out of the ground beneath you." },
  { icon: <Spark size={16} />, who: "Static Wisp", attitude: "Bizarre", text: "A ball of electricity crackles near your head, singeing your hair." },
  { icon: <Droplets size={16} />, who: "Gray Ooze", attitude: "Hostile", text: "A puddle of acidic slime moves toward your metal armor with hunger." },
  { icon: <Bone size={16} />, who: "Skeleton", attitude: "Hostile", text: "A rattling pile of bones rises and draws a rusted bronze shortsword." },
  { icon: <GhostIcon size={16} />, who: "Poltergeist", attitude: "Hostile", text: "Barrels and crates start flying toward you as an unseen spirit rages." },
  { icon: <Bug size={16} />, who: "Giant Spider", attitude: "Hostile", text: "A web drops from above, followed by a bloated, hairy predator." },
  { icon: <Skull size={16} />, who: "Zombie", attitude: "Hostile", text: "A bloated, water-logged corpse lurches toward you from the shadows." },
  { icon: <Axe size={16} />, who: "Owlbear Cub", attitude: "Wary", text: "A feathered, beaked beast-ling growls at you; the mother must be near." },
  { icon: <MonsterIcon size={16} />, who: "Harpy", attitude: "Hostile", text: "A screeching humanoid with bird-wings dives from a high landmark." },
  { icon: <GhostIcon size={16} />, who: "Banshee", attitude: "Hostile", text: "A translucent woman begins a mournful wail that chills your blood." },
  { icon: <MonsterIcon size={16} />, who: "Cockatrice", attitude: "Hostile", text: "A small, lizard-like bird attempts to peck at your exposed skin." },
  { icon: <Bone size={16} />, who: "Lich-Hand", attitude: "Bizarre", text: "A severed skeletal hand scuttles like a crab, trying to trip you." },
  { icon: <Bug size={16} />, who: "Rust Monster", attitude: "Neutral", text: "A strange creature with feathery antennae sniffs at your shield." },
  { icon: <Castle size={16} />, who: "Mimic", attitude: "Hostile", text: "A nearby chest (or door) suddenly grows teeth and attempts to bite." },
  { icon: <MonsterIcon size={16} />, who: "Gargoyle", attitude: "Hostile", text: "A stone statue on a roof suddenly detaches and swoops down." },
  { icon: <Waves size={16} />, who: "Deep-One", attitude: "Hostile", text: "A fish-man with a hooked spear climbs out of the river, croaking." },
  { icon: <Skull size={16} />, who: "Wight", attitude: "Hostile", text: "A gaunt undead in rotted mail raises a life-draining blade." },
  { icon: <GhostIcon size={16} />, who: "Wraith", attitude: "Hostile", text: "A flickering spirit passes through a wall, reaching for your soul." },
  { icon: <Axe size={16} />, who: "Bugbear", attitude: "Hostile", text: "A hairy brute steps from the gloom, mace at the ready." },
  { icon: <Target size={16} />, who: "Goblin Sniper", attitude: "Hostile", text: "A green figure aims a blowgun from the shadows of a rafter." },
  { icon: <Users size={16} />, who: "Hobgoblin Phalanx", attitude: "Wary", text: "Disciplined goblinoids in iron plate block the street." },
  { icon: <Activity size={16} />, who: "Stirges", attitude: "Hostile", text: "1d6 mosquito-like birds dive to drain your blood." },
  { icon: <MonsterIcon size={16} />, who: "Manticore", attitude: "Hostile", text: "A lion with a human face and bat wings perches on a nearby wall." },
  { icon: <Axe size={16} />, who: "Minotaur", attitude: "Hostile", text: "A bull-headed giant huffs steam in the alleyway." },
  { icon: <Bug size={16} />, who: "Carrion Crawler", attitude: "Hostile", text: "A multi-legged worm with paralyzing tentacles crawls across the ceiling." },
  { icon: <Droplets size={16} />, who: "Black Pudding", attitude: "Hostile", text: "A massive, acidic black blob seeps from a crack in the masonry." },
  { icon: <GhostIcon size={16} />, who: "Specter", attitude: "Hostile", text: "A howling ghost of a murdered villager swoops toward you." },
  { icon: <Skull size={16} />, who: "Skeleton Archer", attitude: "Hostile", text: "A pile of bones assembles itself and notches a yellowed arrow." },
  { icon: <Swords size={16} />, who: "Bandit Chief", attitude: "Hostile", text: "A scarred human with bodyguards demands all your gold." },
  { icon: <Flame size={16} />, who: "Hellhound", attitude: "Hostile", text: "An obsidian dog with burning eyes exhales black smoke." },
  { icon: <Spark size={16} />, who: "Will-o'-Wisp", attitude: "Bizarre", text: "A bobbing light leads you toward a dangerous trap." },
  { icon: <Droplets size={16} />, who: "Gelatinous Cube", attitude: "Hostile", text: "The hallway ahead looks strangely clean; a transparent block awaits." },
  { icon: <Skull size={16} />, who: "Mummy", attitude: "Hostile", text: "A bandaged figure lurches from a sarcophagus." },
  { icon: <MonsterIcon size={16} />, who: "Chimera", attitude: "Hostile", text: "A goat, lion, and dragon headed horror roars from the town square." },
  { icon: <Activity size={16} />, who: "Basilisk", attitude: "Hostile", text: "An eight-legged lizard with a stony gaze crawls into the light." },
  { icon: <GhostIcon size={16} />, who: "Shadow Demon", attitude: "Hostile", text: "A demon composed of pure darkness detaches from your shadow." },
  { icon: <Skull size={16} />, who: "Vampire Spawn", attitude: "Friendly", text: "A pale youth asks to be invited into your current location." },
  { icon: <Axe size={16} />, who: "Ogre", attitude: "Hostile", text: "A lumering brute is chewing on a raw horse leg." },
  { icon: <MonsterIcon size={16} />, who: "Medusa", attitude: "Wary", text: "A veiled woman stands among lifelike stone statues." },
  { icon: <Gust size={16} />, who: "Invisible Stalker", attitude: "Hostile", text: "The air chills and footsteps are heard in the dust." },
  { icon: <Bone size={16} />, who: "Naga", attitude: "Bizarre", text: "A human-headed serpent is sorting a pile of coins." },
  { icon: <Target size={16} />, who: "Kobold Trapper", attitude: "Fearful", text: "A lizard-like humanoid is resetting a spiked-pit trap." },
  { icon: <Bug size={16} />, who: "Giant Wasp", attitude: "Hostile", text: "A buzzing drone fills the air as a massive insect dives." },
  { icon: <Skull size={16} />, who: "Wraith-Knight", attitude: "Hostile", text: "A spectral warrior on a skeletal horse charges through the street." },
  { icon: <MonsterIcon size={16} />, who: "Ettin", attitude: "Wary", text: "A two-headed giant is arguing with itself over who to eat." },
  { icon: <Swords size={16} />, who: "Orc Warband", attitude: "Hostile", text: "1d6 gray-skinned warriors surround your group." },
  { icon: <Skull size={16} />, who: "Death Knight", attitude: "Hostile", text: "A skeletal lord commands a legion of 1d10 zombies." },
  { icon: <Bug size={16} />, who: "Giant Scorpion", attitude: "Hostile", text: "A chittering horror with a glowing stinger erupts." },
  { icon: <GhostIcon size={16} />, who: "Blink Dog", attitude: "Neutral", text: "A hound flickers in and out, barking at an unseen threat." },
  { icon: <Spark size={16} />, who: "Efreeti", attitude: "Hostile", text: "A fire giant emerges from a burning building." },
  { icon: <MonsterIcon size={16} />, who: "Gorgon", attitude: "Hostile", text: "A metal-plated bull snorts petrifying gas." },
  { icon: <Droplets size={16} />, who: "Water Weird", attitude: "Hostile", text: "The village fountain forms a serpentine liquid lash." },
  { icon: <Gust size={16} />, who: "Air Elemental", attitude: "Neutral", text: "A whirlwind tosses carts into the air." },
  { icon: <Flame size={16} />, who: "Fire Elemental", attitude: "Hostile", text: "A bonfire detaches and begins to sprint toward you." },
  { icon: <Activity size={16} />, who: "Earth Elemental", attitude: "Hostile", text: "The cobblestones buckle as rock and clay rises up." },
  { icon: <Spark size={16} />, who: "Vrock Demon", attitude: "Hostile", text: "A vulture-headed demon lets out a stun-inducing screech." },
  { icon: <Skull size={16} />, who: "Hezrou Demon", attitude: "Hostile", text: "A toad-like demon with poisonous skin fills the area with a foul stench." },
  { icon: <GhostIcon size={16} />, who: "Marilith Demon", attitude: "Hostile", text: "A six-armed serpent woman draws six blades." },
  { icon: <Swords size={16} />, who: "Glabrezu Demon", attitude: "Wary", text: "A pincer-armed demon offers you a dark wish." },
  { icon: <Skull size={16} />, who: "Balor Demon", attitude: "Hostile", text: "A winged terror of flame looms over the village." },
  { icon: <MonsterIcon size={16} />, who: "Beholder-Kin", attitude: "Hostile", text: "A floating eye with stalks peers from a window." },
  { icon: <Axe size={16} />, who: "Hill Giant", attitude: "Neutral", text: "A massive human is sleeping against a landmark." },
  { icon: <Target size={16} />, who: "Stone Giant", attitude: "Wary", text: "A giant is stacking large boulders in the square." },
  { icon: <Gust size={16} />, who: "Cloud Giant", attitude: "Hostile", text: "A giant in silken robes steps from a storm cloud." },
  { icon: <Spark size={16} />, who: "Storm Giant", attitude: "Bizarre", text: "A titan is playing a harp made of lightning." },
  { icon: <Droplets size={16} />, who: "Aboleth-Shadow", attitude: "Hostile", text: "A psychic resonance fills your mind as a fish-ghost appears." },
  { icon: <MonsterIcon size={16} />, who: "Bulette", attitude: "Hostile", text: "The ground explodes as a 'land shark' lunges." },
  { icon: <Bug size={16} />, who: "Hook Horror", attitude: "Hostile", text: "Clicking sounds precede a beak-headed beast with hooks." },
  { icon: <Gust size={16} />, who: "Wyvern", attitude: "Hostile", text: "A dragon-kin with a scorpion tail dives from the sky." },
  { icon: <Bone size={16} />, who: "Hydra", attitude: "Hostile", text: "Five heads snake out from the river, hungry." },
  { icon: <Flame size={16} />, who: "Red Dragon (Young)", attitude: "Wary", text: "A scarlet beast is sunning itself on the roof." },
  { icon: <Spark size={16} />, who: "Blue Dragon (Young)", attitude: "Hostile", text: "Electrical arcs leap between the horns of a predator." },
  { icon: <Activity size={16} />, who: "Green Dragon (Young)", attitude: "Hostile", text: "A dragon exhales chlorine gas over the well." },
  { icon: <Skull size={16} />, who: "Black Dragon (Young)", attitude: "Hostile", text: "A skull-faced dragon emerges from the dark river." },
  { icon: <Droplets size={16} />, who: "White Dragon (Young)", attitude: "Hostile", text: "The temperature drops forty degrees as a frost beast lands." },
  { icon: <Bug size={16} />, who: "Phase Spider", attitude: "Hostile", text: "A spider shifts into the ethereal plane." },
  { icon: <Spark size={16} />, who: "Chuul", attitude: "Hostile", text: "A lobster-headed horror grabs a PC with pincers." },
  { icon: <GhostIcon size={16} />, who: "Invisible Beast", attitude: "Hostile", text: "A heavy weight slams into you, but nothing is visible." },
  { icon: <Skull size={16} />, who: "Bodak", attitude: "Hostile", text: "A gray featureless undead peers at you with a death gaze." },
  { icon: <Target size={16} />, who: "Displacer Beast", attitude: "Hostile", text: "A six-legged panther appears elsewhere." },
  { icon: <MonsterIcon size={16} />, who: "Remorhaz", attitude: "Hostile", text: "A centipede of ice and fire melts the cobblestones." },
  { icon: <Droplets size={16} />, who: "Gibbering Mouther", attitude: "Bizarre", text: "A mass of eyes begins to scream incoherently." },
  { icon: <Footprints size={16} />, who: "Shambling Mound", attitude: "Hostile", text: "A pile of rot attempts to engulf a resident." },
  { icon: <Bug size={16} />, who: "Umber Hulk", attitude: "Hostile", text: "A massive insectoid brute bursts through a wall." },
  { icon: <Skull size={16} />, who: "Shadow Stalker", attitude: "Hostile", text: "A hunter made of darkness tracks your torch." },
  { icon: <GhostIcon size={16} />, who: "Nightwalker", attitude: "Hostile", text: "A twenty-foot-tall shadow looms over the walls." },
  { icon: <Bug size={16} />, who: "Ankheg", attitude: "Hostile", text: "A burrowing insect erupts from below." },
  { icon: <Gust size={16} />, who: "Peryton", attitude: "Hostile", text: "A stag-headed bird dives to rip out a heart." },
  { icon: <MonsterIcon size={16} />, who: "Grell", attitude: "Hostile", text: "A floating brain attempts to paralyze you." },
  { icon: <Gust size={16} />, who: "Cloaker", attitude: "Hostile", text: "A leather cloak on a wall suddenly unfurls wings." },
  { icon: <Droplets size={16} />, who: "Roper", attitude: "Hostile", text: "A fence post suddenly shoots out sticky tentacles." },
  { icon: <Skull size={16} />, who: "Lich", attitude: "Wary", text: "A skeletal figure is reading a book by a landmark." },
  { icon: <Gust size={16} />, who: "Behir", attitude: "Hostile", text: "A blue reptile exhales lightning down the street." },
  { icon: <Droplets size={16} />, who: "Kraken-Limb", attitude: "Hostile", text: "A single massive tentacle reaches from the river." },
  { icon: <Activity size={16} />, who: "Purple Worm", attitude: "Hostile", text: "The village shakes as a fifty-foot worm surfaces." },
  { icon: <Target size={16} />, who: "The Tarasque-Lite", attitude: "Hostile", text: "A mountain-sized beast is seen walking toward you." }
];

// --- Decoding Helpers ---
function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
  const channelData = buffer.getChannelData(0);
  for (let i = 0; i < dataInt16.length; i++) {
    channelData[i] = dataInt16[i] / 32768.0;
  }
  return buffer;
}

const WEATHER_TABLE = [
  "Clear skies, bright sun, gentle breeze",
  "Warm and humid, haze on the horizon",
  "Cool and crisp morning, warming by midday",
  "Overcast but dry, low gray clouds",
  "Light drizzle that comes and goes",
  "Steady rain, puddles forming",
  "Sudden downpour, visibility reduced",
  "Thunderstorm with occasional lightning",
  "Heavy fog, sound carries strangely",
  "Patchy fog that burns off by noon",
  "Strong winds, loose debris blowing",
  "Gusty winds with shifting directions",
  "Cold snap, breath visible in the air",
  "Heatwave, oppressive and draining",
  "Light snowfall, soft and quiet",
  "Heavy snow, travel slowed",
  "Sleet or freezing rain, surfaces slick",
  "Hailstorm, small pellets rattling down",
  "Unseasonably strange weather (GM’s choice)",
  "Dramatic shift: roll twice and combine"
];

interface DemoOverride {
  race: string;
  percent: number;
}

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [mapLoading, setMapLoading] = useState(false);
  const [poiLoading, setPoiLoading] = useState(false);
  const [gossipLoading, setGossipLoading] = useState(false);
  const [village, setVillage] = useState<VillageData | null>(null);
  const [gossip, setGossip] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editableNotes, setEditableNotes] = useState("");
  const [npcFilter, setNpcFilter] = useState("");
  const [portraitLoading, setPortraitLoading] = useState<Record<number, boolean>>({});
  const [voiceLoading, setVoiceLoading] = useState<Record<number, boolean>>({});
  const [lastWeatherRoll, setLastWeatherRoll] = useState<number | null>(null);
  const [lastEventRoll, setLastEventRoll] = useState<number | null>(null);
  const [lastHookRoll, setLastHookRoll] = useState<number | null>(null);
  
  const [isOverrideEnabled, setIsOverrideEnabled] = useState(false);
  const [demoOverrides, setDemoOverrides] = useState<DemoOverride[]>([
    { race: "Human", percent: 85 },
    { race: "Halfling", percent: 8 },
    { race: "Dwarf", percent: 4 },
    { race: "Elf", percent: 3 }
  ]);
  const [showDemoSettings, setShowDemoSettings] = useState(false);

  const [lastDayInsideRoll, setLastDayInsideRoll] = useState<number | null>(null);
  const [lastNightInsideRoll, setLastNightInsideRoll] = useState<number | null>(null);
  const [lastMonsterRoll, setLastMonsterRoll] = useState<number | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalPercent = useMemo(() => demoOverrides.reduce((sum, d) => sum + d.percent, 0), [demoOverrides]);

  const calculateDemographics = (total: number) => {
    if (isOverrideEnabled && totalPercent === 100) {
      const results: any = { humans: 0, halflings: 0, dwarves: 0, elves: 0, others: [] };
      demoOverrides.forEach(d => {
        const count = Math.floor(total * (d.percent / 100));
        if (d.race.toLowerCase() === 'human') results.humans = count;
        else if (d.race.toLowerCase() === 'halfling') results.halflings = count;
        else if (d.race.toLowerCase() === 'dwarf') results.dwarves = count;
        else if (d.race.toLowerCase() === 'elf') results.elves = count;
        else results.others.push({ race: d.race, count });
      });
      const currentSum = results.humans + results.halflings + results.dwarves + results.elves + results.others.reduce((s: number, o: any) => s + o.count, 0);
      if (currentSum < total) {
        if (results.humans > 0) results.humans += (total - currentSum);
        else results.halflings += (total - currentSum);
      }
      return results;
    }
    const humans = Math.floor(total * 0.85);
    const halflings = Math.floor(total * 0.08);
    const dwarves = Math.floor(total * 0.03);
    const elves = Math.floor(total * 0.02);
    const remaining = total - (humans + halflings + dwarves + elves);
    return { humans, halflings, dwarves, elves, others: remaining > 0 ? [{ race: 'Half-Orc', count: remaining }] : [] };
  };

  const handleGenerate = async () => {
    if (isOverrideEnabled && totalPercent !== 100) {
      alert("Demographics must sum to exactly 100% before manifesting.");
      return;
    }
    setLoading(true);
    setError(null);
    setPortraitLoading({});
    setVoiceLoading({});
    setGossip([]);
    setLastWeatherRoll(null);
    setLastEventRoll(null);
    setLastHookRoll(null);
    setLastDayInsideRoll(null);
    setLastNightInsideRoll(null);
    setLastMonsterRoll(null);
    try {
      const pop = Math.floor(Math.random() * (300 - 200) + 200);
      const data = await generateVillageDetails("Cinderglade", pop, calculateDemographics(pop));
      setVillage(data);
      setEditableNotes(data.gmNotes || "");
    } catch (err) {
      setError("Generation failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!village) return;
    const dataToSave = { ...village, gmNotes: editableNotes, _meta: { isOverrideEnabled, demoOverrides } };
    const blob = new Blob([JSON.stringify(dataToSave, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${village.name.toLowerCase().replace(/\s+/g, '_')}_dossier.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleLoadClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const loadedData = JSON.parse(event.target?.result as string);
        setVillage(loadedData);
        setEditableNotes(loadedData.gmNotes || "");
        if (loadedData._meta) {
          setIsOverrideEnabled(loadedData._meta.isOverrideEnabled || false);
          setDemoOverrides(loadedData._meta.demoOverrides || []);
        }
      } catch (err) {
        alert("Failed to read scroll.");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const rollWeather = () => setLastWeatherRoll(Math.floor(Math.random() * 20) + 1);
  const rollEvent = () => setLastEventRoll(Math.floor(Math.random() * 100) + 1);
  const rollHook = () => setLastHookRoll(Math.floor(Math.random() * 100) + 1);
  const rollDayInside = () => setLastDayInsideRoll(Math.floor(Math.random() * 20) + 1);
  const rollNightInside = () => setLastNightInsideRoll(Math.floor(Math.random() * 20) + 1);
  const rollMonster = () => setLastMonsterRoll(Math.floor(Math.random() * 100) + 1);

  const addOverrideRow = () => setDemoOverrides([...demoOverrides, { race: "New Race", percent: 0 }]);
  const removeOverrideRow = (idx: number) => setDemoOverrides(demoOverrides.filter((_, i) => i !== idx));
  const updateOverride = (idx: number, field: keyof DemoOverride, value: string | number) => {
    const next = [...demoOverrides];
    next[idx] = { ...next[idx], [field]: value };
    setDemoOverrides(next);
  };

  const handleGeneratePOI = async () => {
    if (!village || poiLoading) return;
    setPoiLoading(true);
    try {
      const poiData = await generatePOI(village);
      setVillage({ ...village, poi: poiData });
    } catch (err) { console.error(err); } finally { setPoiLoading(false); }
  };

  const handleGeneratePortrait = async (idx: number, npc: DetailedNPC) => {
    if (!village) return;
    setPortraitLoading(prev => ({ ...prev, [idx]: true }));
    try {
      const url = await generateNPCPortrait(npc);
      const updatedResidents = [...village.residents];
      updatedResidents[idx] = { ...updatedResidents[idx], portraitUrl: url };
      setVillage({ ...village, residents: updatedResidents });
    } catch (err) { console.error(err); } finally { setPortraitLoading(prev => ({ ...prev, [idx]: false })); }
  };

  const handleRollGossip = async () => {
    if (!village || gossipLoading) return;
    setGossipLoading(true);
    try {
      const gossipData = await generateVillageGossip(village);
      setGossip(prev => [...gossipData, ...prev].slice(0, 9));
    } catch (err) { console.error(err); } finally { setGossipLoading(false); }
  };

  const handleGenerateMap = async () => {
    if (!village) return;
    setMapLoading(true);
    try {
      const url = await generateVillageMap(village);
      setVillage({ ...village, mapUrl: url });
    } catch (err) { console.error(err); } finally { setMapLoading(false); }
  };

  const updateBusinessGMNotes = (bIdx: number, newNotes: string) => {
    if (!village) return;
    const newBusinesses = [...village.businesses];
    newBusinesses[bIdx] = { ...newBusinesses[bIdx], gmNotes: newNotes };
    setVillage({ ...village, businesses: newBusinesses });
  };

  const playVoice = async (idx: number, npc: DetailedNPC) => {
    if (voiceLoading[idx]) return;
    setVoiceLoading(prev => ({ ...prev, [idx]: true }));
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      const ctx = audioContextRef.current;
      const base64 = await generateMerchantVoice(npc);
      const audioData = decodeBase64(base64);
      const buffer = await decodeAudioData(audioData, ctx);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start();
    } catch (err) { console.error(err); } finally { setVoiceLoading(prev => ({ ...prev, [idx]: false })); }
  };

  const getAlignmentDetails = (alignment: string) => {
    switch(alignment) {
      case 'Lawful': return { icon: <Scale size={14} />, color: 'text-blue-900', bg: 'bg-blue-100' };
      case 'Chaotic': return { icon: <Zap size={14} />, color: 'text-purple-900', bg: 'bg-purple-100' };
      default: return { icon: <CircleDot size={14} />, color: 'text-stone-800', bg: 'bg-stone-200' };
    }
  };

  const getMoraleDetails = (morale: string) => {
    switch(morale) {
      case 'Hopeful': return { icon: <Sun size={24} />, color: 'text-emerald-900', bg: 'bg-emerald-100', border: 'border-emerald-800' };
      case 'Fearful': return { icon: <Skull size={24} />, color: 'text-red-900', bg: 'bg-red-100', border: 'border-red-800' };
      case 'Resentful': return { icon: <HeartCrack size={24} />, color: 'text-orange-900', bg: 'bg-orange-100', border: 'border-orange-800' };
      case 'Apathetic': return { icon: <Meh size={24} />, color: 'text-stone-700', bg: 'bg-stone-200', border: 'border-stone-500' };
      case 'Defiant': return { icon: <Shield size={24} />, color: 'text-indigo-900', bg: 'bg-indigo-100', border: 'border-indigo-800' };
      default: return { icon: <Activity size={24} />, color: 'text-stone-900', bg: 'bg-stone-100', border: 'border-stone-800' };
    }
  };

  const getRelationTypeDetails = (type: string) => {
    switch(type) {
      case 'Good': return { icon: <HandHelping size={18} />, color: 'text-emerald-900', bg: 'bg-emerald-100', border: 'border-emerald-700' };
      case 'Neutral': return { icon: <Scale size={18} />, color: 'text-stone-900', bg: 'bg-stone-100', border: 'border-stone-700' };
      case 'Harmful': return { icon: <Swords size={18} />, color: 'text-red-900', bg: 'bg-red-100', border: 'border-red-700' };
      default: return { icon: <Globe size={18} />, color: 'text-stone-900', bg: 'bg-stone-100', border: 'border-stone-700' };
    }
  };

  const getSeasonIcon = (season: string) => {
    switch(season) {
      case 'Spring': return <Sprout className="text-emerald-600" size={18} />;
      case 'Summer': return <Sun className="text-amber-600" size={18} />;
      case 'Fall': return <Leaf className="text-orange-700" size={18} />;
      case 'Winter': return <Snowflake className="text-blue-500" size={18} />;
      case 'Major': return <Star className="text-purple-600 animate-pulse" size={20} />;
      default: return <CalendarDays size={18} />;
    }
  };

  const getRelationshipStyles = (rawScore: number) => {
    const score = Math.max(1, Math.min(10, Math.round(rawScore)));
    if (score >= 8) return { bg: 'bg-emerald-100', border: 'border-emerald-600', text: 'text-emerald-900', icon: <Heart size={14} className="text-emerald-700" />, effects: 'animate-pulse-subtle' };
    if (score <= 3) return { bg: 'bg-rose-100', border: 'border-rose-600', text: 'text-rose-900', icon: <Swords size={14} className="text-rose-700" />, effects: '' };
    return { bg: 'bg-stone-100', border: 'border-stone-400', text: 'text-stone-800', icon: <Minus size={14} className="text-stone-600" />, effects: '' };
  };

  const getStandingCategory = (npc: DetailedNPC) => {
    const totalScore = npc.relationships.reduce((acc, r) => acc + r.score, 0);
    const avg = totalScore / (npc.relationships.length || 1);
    
    // Scale 1-10: avg <= 4 is poor standing, >= 7.5 is excellent.
    if (avg <= 4.0) return { label: 'Pariah', color: 'text-red-950', icon: <Frown size={12}/> };
    if (avg >= 7.5) return { label: 'Pillar', color: 'text-amber-900', icon: <Crown size={12}/> };
    return { label: 'Resident', color: 'text-stone-900', icon: <Users size={12}/> };
  };

  const getAttitudeColor = (attitude: string) => {
    switch(attitude) {
      case 'Friendly': return 'text-emerald-950 bg-emerald-100';
      case 'Hostile': return 'text-red-950 bg-red-100';
      case 'Wary': return 'text-orange-950 bg-orange-100';
      case 'Bizarre': return 'text-purple-950 bg-purple-100';
      default: return 'text-stone-950 bg-stone-100';
    }
  };

  const chartData = village ? [
    { name: 'Humans', value: village.demographics.humans, color: '#4b5563' },
    { name: 'Halflings', value: village.demographics.halflings, color: '#059669' },
    { name: 'Dwarves', value: village.demographics.dwarves, color: '#b45309' },
    { name: 'Elves', value: village.demographics.elves, color: '#7c3aed' },
    ...village.demographics.others.map(o => ({ name: o.race, value: o.count, color: '#dc2626' }))
  ] : [];

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center">
      <div className="max-w-6xl w-full flex flex-col md:flex-row justify-between items-center gap-6 mb-12 no-print">
        <div className="text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-bold medieval-font text-amber-500 mb-2 flex items-center gap-3">
            <Flame className="w-10 h-10 animate-pulse text-amber-600" />
            Shadowdark Architect
          </h1>
          <p className="text-slate-400 italic">"Full Dossier: Lives, Deaths, and Grudges in the Gloom."</p>
        </div>
        <div className="flex flex-wrap gap-4 justify-center">
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".json" />
          <button onClick={() => setShowDemoSettings(!showDemoSettings)} className={`font-bold py-3 px-5 rounded-lg shadow-xl transition-all transform hover:scale-105 flex items-center gap-2 text-base medieval-font border border-amber-900/50 ${showDemoSettings ? 'bg-amber-600 text-white' : 'bg-stone-800 text-amber-500'}`}><Settings2 size={18} /> Census</button>
          <button onClick={handleLoadClick} className="bg-stone-800 hover:bg-stone-700 text-amber-500 font-bold py-3 px-5 rounded-lg shadow-xl transition-all transform hover:scale-105 flex items-center gap-2 text-base medieval-font border border-amber-900/50"><FolderOpen size={18} /> Load</button>
          <button onClick={handleSave} disabled={!village} className="bg-stone-800 hover:bg-stone-700 disabled:opacity-50 text-amber-500 font-bold py-3 px-5 rounded-lg shadow-xl transition-all transform hover:scale-105 flex items-center gap-2 text-base medieval-font border border-amber-900/50"><Save size={18} /> Save</button>
          <button onClick={() => window.print()} className="bg-stone-800 hover:bg-stone-700 text-amber-500 font-bold py-3 px-5 rounded-lg shadow-xl transition-all transform hover:scale-105 flex items-center gap-2 text-base medieval-font border border-amber-900/50"><Printer size={18} /> Print</button>
          <button onClick={handleGenerate} disabled={loading} className="bg-amber-600 hover:bg-amber-700 disabled:bg-slate-700 text-white font-bold py-3 px-6 rounded-lg shadow-xl transition-all transform hover:scale-105 flex items-center gap-2 text-base medieval-font">{loading ? <RefreshCw className="animate-spin" /> : <Scroll />} Manifest Village</button>
        </div>
      </div>

      {showDemoSettings && (
        <div className="max-w-xl w-full parchment mb-12 p-6 rounded-sm shadow-2xl border-4 border-dashed border-stone-400 no-print">
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-2xl font-bold medieval-font flex items-center gap-2 uppercase tracking-tight text-stone-900"><Users className="w-6 h-6" /> Census Architect</h3>
             <div className="flex items-center gap-3">
               <span className="text-xs font-bold uppercase text-stone-600">Manual Override</span>
               <button onClick={() => setIsOverrideEnabled(!isOverrideEnabled)} className={`w-12 h-6 rounded-full transition-colors relative ${isOverrideEnabled ? 'bg-amber-600' : 'bg-stone-400'}`}><div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${isOverrideEnabled ? 'left-7' : 'left-1'}`} /></button>
             </div>
          </div>
          <div className={`space-y-3 transition-opacity ${!isOverrideEnabled ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
            {demoOverrides.map((row, idx) => (
              <div key={idx} className="flex gap-3 items-center">
                <input type="text" value={row.race} onChange={(e) => updateOverride(idx, 'race', e.target.value)} className="flex-1 bg-white/50 border-2 border-stone-300 rounded px-3 py-1 text-sm font-bold text-stone-800" placeholder="Race Name" />
                <div className="flex items-center gap-2 w-24"><input type="number" value={row.percent} onChange={(e) => updateOverride(idx, 'percent', parseInt(e.target.value) || 0)} className="w-full bg-white/50 border-2 border-stone-300 rounded px-2 py-1 text-sm font-bold text-stone-800" /><span className="text-xs font-black text-stone-600">%</span></div>
                <button onClick={() => removeOverrideRow(idx)} className="text-stone-400 hover:text-red-600 transition-colors"><Trash2 size={16} /></button>
              </div>
            ))}
            <div className="flex justify-between items-center pt-4 mt-4 border-t border-stone-300">
               <button onClick={addOverrideRow} className="text-xs font-black bg-stone-800 text-amber-500 px-4 py-2 rounded hover:bg-stone-700 flex items-center gap-1 uppercase"><Plus size={14} /> Add Race</button>
               <div className={`text-lg font-black medieval-font ${totalPercent === 100 ? 'text-emerald-700' : 'text-red-700'}`}>Total: {totalPercent}%</div>
            </div>
          </div>
        </div>
      )}

      {village && (
        <div className="w-full max-w-4xl flex flex-col gap-6 relative">
          <div className="parchment p-8 md:p-12 rounded-sm shadow-2xl border-2 border-stone-400/30 relative overflow-visible h-auto">
            <section className="print:print-page-border">
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none no-print"><Skull className="w-96 h-96" /></div>
              <div className="border-b-4 border-double border-stone-800 pb-6 mb-12 text-center">
                <h2 className="text-7xl font-bold medieval-font mb-2 uppercase tracking-tighter">{village.name}</h2>
                <div className="flex items-center justify-center gap-4 text-xs font-bold uppercase tracking-[0.2em] opacity-80"><span>Village Dossier</span><div className="w-2 h-2 rounded-full bg-stone-800"></div><span>Shadowdark RPG</span></div>
              </div>
              <div className="mb-12 flex flex-col md:flex-row gap-8">
                <div className="flex-1"><div className="flex items-center gap-2 text-2xl font-bold medieval-font border-b-2 border-stone-800 mb-4 pb-1 uppercase"><Scroll className="w-6 h-6" /> Narrative Manifest</div><p className="text-2xl italic font-serif leading-relaxed text-stone-950 bg-white/30 p-8 border-l-8 border-stone-800 rounded-r shadow-inner font-bold">"{village.description}"</p></div>
                <div className="w-full md:w-64 break-inside-avoid">
                  <div className="flex items-center gap-2 text-2xl font-bold medieval-font border-b-2 border-stone-800 mb-4 pb-1 uppercase"><Activity className="w-6 h-6" /> Town Morale</div>
                  {(() => {
                    const details = getMoraleDetails(village.morale);
                    return (<div className={`p-6 rounded border-4 flex flex-col items-center justify-center text-center shadow-md ${details.bg} ${details.border} ${details.color}`}><div className="mb-2">{details.icon}</div><div className="text-2xl font-black medieval-font uppercase tracking-tighter">{village.morale}</div><p className="text-[10px] mt-2 font-bold opacity-70 italic">Collective spirit in the wake of gloom.</p></div>);
                  })()}
                </div>
              </div>

              {/* Nearby Settlement Relations Section */}
              <div className="mb-12 break-inside-avoid">
                <h3 className="flex items-center gap-2 text-2xl font-bold medieval-font border-b-2 border-stone-800 mb-6 pb-1 uppercase">
                  <Globe className="w-6 h-6" /> Nearby Settlement Relations
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {village.settlementRelations.map((rel, idx) => {
                    const details = getRelationTypeDetails(rel.type);
                    return (
                      <div key={idx} className={`p-4 rounded border-2 shadow-sm ${details.bg} ${details.border} relative overflow-hidden`}>
                        <div className="flex justify-between items-center mb-2">
                           <h4 className="font-bold text-stone-950 medieval-font text-lg">{rel.settlementName}</h4>
                           <div className={`flex items-center gap-1 text-[10px] font-black uppercase ${details.color}`}>
                             {details.icon} {rel.type}
                           </div>
                        </div>
                        <div className="text-[10px] font-black bg-white/40 px-2 py-0.5 rounded inline-block mb-2 text-stone-800 uppercase tracking-widest">{rel.status}</div>
                        <p className="text-sm italic font-bold leading-tight text-stone-950 font-serif">"{rel.description}"</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Local Festivals Section */}
              <div className="mb-12 page-break-before break-inside-avoid">
                <h3 className="flex items-center gap-2 text-2xl font-bold medieval-font border-b-2 border-stone-800 mb-6 pb-1 uppercase">
                  <CalendarDays className="w-6 h-6" /> The Cycle of Tradition: Local Festivals
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {village.festivals.map((fest, idx) => (
                    <div key={idx} className="p-5 bg-white/50 border-2 border-stone-400 rounded shadow-inner relative overflow-hidden group hover:border-amber-700 transition-colors">
                      <div className="flex justify-between items-start mb-3 border-b border-stone-300 pb-2">
                        <div>
                          <h4 className="font-bold text-stone-950 medieval-font text-xl uppercase tracking-tight">{fest.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            {getSeasonIcon(fest.season)}
                            <span className="text-[10px] font-black uppercase text-stone-600 tracking-widest">
                              {fest.timing} of {fest.season}
                            </span>
                          </div>
                        </div>
                        <div className="opacity-10 group-hover:opacity-30 transition-opacity">
                          {getSeasonIcon(fest.season)}
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="text-[9px] font-black text-amber-900 uppercase mb-1 flex items-center gap-1">
                            <BookOpen size={10} /> The Old Lore
                          </p>
                          <p className="text-xs italic text-stone-950 leading-tight font-serif bg-stone-200/40 p-2 rounded font-bold">
                            "{fest.lore}"
                          </p>
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-stone-500 uppercase mb-1 flex items-center gap-1">
                            <RefreshCw size={10} /> Modern Practice
                          </p>
                          <p className="text-xs text-stone-950 leading-snug font-bold">
                            {fest.modernPractice}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-12 break-inside-avoid">
                <h3 className="flex items-center gap-2 text-2xl font-bold medieval-font border-b-2 border-stone-800 mb-6 pb-1 uppercase"><Calendar className="w-6 h-6" /> Current Events</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {village.currentEvents.map((event, idx) => (<div key={idx} className="bg-amber-800/5 p-4 border-l-4 border-amber-900 shadow-sm relative overflow-hidden group"><div className="text-[10px] font-black text-amber-900/40 mb-1 uppercase">SITUATION {idx + 1}</div><p className="text-base italic text-stone-950 font-bold leading-tight">"{event}"</p><ZapOff className="absolute -bottom-2 -right-2 w-8 h-8 text-amber-900/10" /></div>))}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16 break-inside-avoid">
                <div>
                  <h3 className="flex items-center gap-2 text-2xl font-bold medieval-font border-b border-stone-800 mb-6 pb-1"><Users className="w-6 h-6" /> Census Data</h3>
                  <div className="h-64 w-full bg-white/20 p-4 rounded-lg border border-stone-200"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={chartData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>{chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}</Pie><Tooltip /><Legend layout="vertical" align="right" verticalAlign="middle" /></PieChart></ResponsiveContainer></div>
                </div>
                <div><div className="flex justify-between items-center border-b border-stone-800 mb-4 pb-1"><h3 className="flex items-center gap-2 text-2xl font-bold medieval-font"><MapIcon className="w-6 h-6" /> Local Chart</h3><button onClick={handleGenerateMap} className="text-[10px] font-bold bg-stone-800 text-amber-500 px-2 py-1 rounded no-print hover:bg-stone-700">{mapLoading ? 'Drafting...' : 'Update Map'}</button></div><div className="w-full aspect-[16/9] bg-stone-900/10 border-2 border-stone-800 flex items-center justify-center overflow-hidden shadow-md">{village.mapUrl ? <img src={village.mapUrl} className="w-full h-full object-cover" /> : <div className="text-stone-400 italic">No visual chart drafted.</div>}</div></div>
              </div>
            </section>

            <section className="page-break-before print:print-page-border">
              <h3 className="text-4xl font-bold medieval-font border-b-4 border-stone-800 mb-8 pb-4 flex items-center gap-4 uppercase tracking-wider"><Compass size={36} /> Random Encounter Archives</h3>
              <div className="grid grid-cols-1 gap-12">
                {[
                  { title: "Day: Inside Walls", icon: <Sun size={24} />, roll: lastDayInsideRoll, handler: rollDayInside, table: ENCOUNTERS_DAY_INSIDE, size: 20 },
                  { title: "Night: Inside Walls", icon: <Moon size={24} />, roll: lastNightInsideRoll, handler: rollNightInside, table: ENCOUNTERS_NIGHT_INSIDE, size: 20 },
                  { title: "Wandering Monsters", icon: <MonsterIcon size={24} />, roll: lastMonsterRoll, handler: rollMonster, table: ENCOUNTERS_MONSTERS, size: 100 }
                ].map((category, cIdx) => (
                  <div key={cIdx} className="break-inside-avoid">
                    <div className="flex justify-between items-center mb-4 border-b-2 border-stone-800 pb-1">
                       <h4 className="text-xl font-bold medieval-font uppercase flex items-center gap-2">{category.icon} {category.title}</h4>
                       <button onClick={category.handler} className="no-print bg-stone-800 text-amber-500 hover:bg-stone-700 px-3 py-1 rounded text-[10px] font-black uppercase flex items-center gap-1"><Dices size={12} /> Roll 1d{category.size}</button>
                    </div>
                    <div className="bg-white/40 p-1 border-2 border-stone-800 rounded-sm">
                       <div className="max-h-[400px] overflow-y-auto custom-scrollbar print:max-h-none print:overflow-visible">
                         <table className="w-full text-left text-sm font-serif">
                            <thead className="bg-stone-800 text-amber-500 text-[10px] font-black sticky top-0 z-10">
                              <tr>
                                <th className="py-2 px-3 w-12 text-center">d{category.size}</th>
                                <th className="py-2 px-3 w-1/4">Encounter</th>
                                <th className="py-2 px-3 w-20 text-center">Attitude</th>
                                <th className="py-2 px-3">Situation Details</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-300">
                              {category.table.map((enc, eIdx) => {
                                const rollVal = eIdx + 1;
                                const isRolled = category.roll === rollVal;
                                return (
                                  <tr key={eIdx} className={`transition-colors duration-500 ${isRolled ? 'bg-amber-400 font-black' : 'hover:bg-amber-100/30'}`}>
                                    <td className="py-2 px-3 text-center border-r border-stone-300 font-black text-stone-950">{rollVal}</td>
                                    <td className="py-2 px-3 font-bold flex items-center gap-2 text-black"><span className="text-stone-800">{enc.icon}</span> {enc.who}</td>
                                    <td className="py-2 px-3 text-center"><span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${getAttitudeColor(enc.attitude)}`}>{enc.attitude}</span></td>
                                    <td className="py-2 px-3 italic text-stone-950 font-bold leading-snug">{enc.text}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                         </table>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="page-break-before print:print-page-border">
              <h3 className="text-3xl font-bold medieval-font border-b-2 border-stone-800 mb-8 pb-2 flex items-center gap-2 uppercase tracking-wider"><Briefcase size={28} /> Establishment Records</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
                {village.businesses.map((business, bIdx) => (
                  <div key={bIdx} className="p-6 bg-white/50 border-2 border-stone-300 rounded shadow-md break-inside-avoid relative overflow-visible">
                    <div className="flex justify-between items-start mb-4"><h4 className="font-bold text-stone-900 medieval-font text-2xl uppercase tracking-tighter">{business.name}</h4><span className="text-[10px] font-black bg-stone-800 text-white px-3 py-1 rounded uppercase">{business.type}</span></div>
                    <p className="text-xs italic text-stone-700 mb-3 border-b border-stone-200 pb-2">Proprietor: <span className="font-bold text-stone-950">{business.owner.name}</span></p>
                    <p className="text-base text-stone-950 mb-4 leading-relaxed font-serif font-bold">{business.description}</p>
                    <div className="space-y-4">
                      <div className="bg-amber-100/60 p-3 rounded border-l-4 border-amber-800 shadow-inner"><p className="text-[10px] font-black text-amber-900 uppercase mb-1">Local Rumor</p><p className="text-sm italic text-amber-950 leading-tight font-bold">"{business.rumor}"</p></div>
                      <div className="p-4 border-2 border-dashed border-stone-400 rounded bg-white/40"><label className="text-[9px] font-black text-stone-500 uppercase block mb-2 flex items-center gap-1"><Edit2 size={10} /> GM Establishment Notes</label><textarea className="w-full text-base bg-transparent border-none focus:ring-0 italic text-stone-950 font-bold min-h-[80px] resize-none leading-relaxed" placeholder="Record shop secrets here..." value={business.gmNotes} onChange={(e) => updateBusinessGMNotes(bIdx, e.target.value)} /></div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="page-break-before print:print-page-border">
              <h3 className="text-2xl font-bold medieval-font border-b-2 border-stone-800 mb-8 pb-1 uppercase tracking-wider flex items-center gap-2"><Swords size={28} /> Campaign Hooks & Points of Interest</h3>
              <div className="grid grid-cols-1 gap-12 mb-12">
                <div className="break-inside-avoid">
                  <h4 className="text-xl font-bold medieval-font mb-4 flex items-center gap-2"><Castle /> Landmarks</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{village.landmarks.map((l, i) => (<div key={i} className="p-5 bg-white/40 border-2 border-stone-300 rounded shadow-sm break-inside-avoid"><h5 className="font-bold text-stone-900 medieval-font text-xl mb-1">{l.name}</h5><p className="text-sm italic text-stone-950 mb-4 leading-snug font-bold">{l.description}</p><div className="bg-amber-800/10 p-3 rounded text-sm font-bold text-amber-950 border-l-4 border-amber-900 italic">"{l.encounterHook}"</div></div>))}</div>
                </div>
                <div className="break-inside-avoid">
                  <h4 className="text-xl font-bold medieval-font mb-4 flex items-center gap-2"><Scroll /> Local Quests</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{village.mainQuests.map((q, i) => (<div key={i} className="p-4 bg-stone-800/5 border-l-8 border-stone-800 rounded-r shadow-sm"><h5 className="font-bold text-base text-stone-900 uppercase tracking-tighter mb-1">{q.title}</h5><p className="text-sm italic text-stone-950 mb-2 leading-tight font-bold">{q.description}</p><div className="flex items-center gap-2"><span className="text-[10px] font-black bg-stone-800 text-amber-400 px-3 py-1 rounded-full uppercase">Reward: {q.reward}</span></div></div>))}</div>
                </div>
              </div>
            </section>

            {/* Restored NPC Section with Fixes */}
            <section className="page-break-before print:print-page-border">
              <div className="flex flex-col md:flex-row justify-between items-end border-b-4 border-stone-800 mb-12 pb-4 gap-4">
                <h3 className="text-4xl font-bold medieval-font flex items-center gap-2 uppercase tracking-wider border-none p-0">
                  <UserCircle size={36} /> Master Resident Dossiers
                </h3>
                <div className="no-print relative mb-1">
                  <Search className="absolute left-2 top-2 w-4 h-4 text-stone-400" />
                  <input type="text" placeholder="Filter residents..." className="pl-8 py-2 text-sm bg-white border-2 border-stone-300 rounded focus:ring-2 focus:ring-amber-500 outline-none" onChange={(e) => setNpcFilter(e.target.value)} />
                </div>
              </div>
              <div className="space-y-16">
                {village.residents.filter(r => r.name.toLowerCase().includes(npcFilter.toLowerCase())).map((npc, idx) => {
                  const standing = getStandingCategory(npc);
                  const alignDetails = getAlignmentDetails(npc.alignment);
                  return (
                    <div key={idx} className="p-10 border-4 border-stone-800 bg-white/40 rounded-sm shadow-2xl relative group break-inside-avoid overflow-visible npc-card-print">
                      <div className="flex flex-col md:flex-row gap-10">
                        <div className="w-full md:w-1/3 flex flex-col items-center text-center">
                          <div className="relative w-full aspect-square bg-stone-800/10 mb-8 rounded-sm shadow-lg border-2 border-stone-800 overflow-hidden group/portrait">
                            {npc.portraitUrl ? <img src={npc.portraitUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center">{portraitLoading[idx] ? <RefreshCw className="w-16 h-16 animate-spin text-amber-600" /> : <UserCircle className="w-full h-full opacity-10 p-4" />}</div>}
                            {!portraitLoading[idx] && <button onClick={() => handleGeneratePortrait(idx, npc)} className={`absolute inset-0 bg-stone-900/80 transition-opacity flex flex-col items-center justify-center gap-3 text-amber-400 font-bold medieval-font no-print ${npc.portraitUrl ? 'opacity-0 group-hover/portrait:opacity-100' : 'opacity-100'}`}><Wand2 className="w-10 h-10" /><span className="text-lg">Manifest Portrait</span></button>}
                            <button onClick={(e) => { e.stopPropagation(); playVoice(idx, npc); }} className="absolute bottom-4 right-4 p-4 bg-amber-600 text-white rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all no-print disabled:opacity-50 z-10">{voiceLoading[idx] ? <RefreshCw className="animate-spin" size={24} /> : <Volume2 size={24} />}</button>
                          </div>
                          <h4 className="text-4xl font-bold medieval-font leading-none uppercase tracking-tighter mb-2">{npc.name}</h4>
                          <p className="text-xs font-black text-stone-600 uppercase tracking-widest mb-4">{npc.sex} • {npc.race} • {npc.role}</p>
                          <div className="flex flex-col gap-3 w-full px-4">
                            <div className={`text-xs font-black px-4 py-2 bg-white rounded border-2 border-stone-800 shadow-sm flex items-center justify-center gap-2 ${standing.color}`}>{standing.icon} {standing.label}</div>
                            <div className={`text-xs font-black px-4 py-2 ${alignDetails.bg} rounded border-2 border-stone-800 shadow-sm flex items-center justify-center gap-2 ${alignDetails.color}`}>{alignDetails.icon} {npc.alignment}</div>
                          </div>
                        </div>
                        <div className="flex-1">
                           <div className="grid grid-cols-1 gap-10">
                              <div>
                                 <h5 className="text-xs font-black uppercase text-stone-400 mb-3 tracking-[0.2em]">Psychological Profile</h5>
                                 <p className="italic text-xl text-stone-950 border-l-8 border-stone-800 pl-6 mb-6 leading-relaxed font-serif font-bold">"{npc.personality}"</p>
                                 <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                                    <div className="px-4 py-2 bg-indigo-900 text-white text-xs font-bold rounded flex items-center justify-center gap-2 uppercase shadow-sm"><Goal size={12} /> {npc.motivation}</div>
                                    <div className="px-4 py-2 bg-stone-950 text-amber-400 text-xs font-bold rounded flex items-center justify-center gap-2 uppercase shadow-sm"><Fingerprint size={12} /> {npc.trait}</div>
                                    <div className="px-4 py-2 bg-rose-950 text-white text-xs font-bold rounded flex items-center justify-center gap-2 uppercase shadow-sm"><Shield size={12} /> AC {npc.stats.ac} | HP {npc.stats.hp}</div>
                                 </div>
                                 <div className="bg-red-50/80 p-4 border-2 border-red-200 rounded-sm">
                                    <h6 className="text-[10px] font-black text-red-900 uppercase mb-2 tracking-widest">Alignment Shadow Secret</h6>
                                    <p className="text-sm italic text-red-950 font-serif leading-snug font-bold">{npc.secret}</p>
                                 </div>
                              </div>
                              <div>
                                 <h5 className="text-xs font-black uppercase text-stone-400 mb-4 tracking-[0.2em]">Social Influence Matrix</h5>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] md:max-h-none overflow-y-auto pr-2 custom-scrollbar print:max-h-none print:overflow-visible h-auto">
                                    {npc.relationships.map((rel, ridx) => {
                                       const styles = getRelationshipStyles(rel.score);
                                       return (<div key={ridx} className={`p-3 rounded border-2 transition-all duration-500 ${styles.bg} ${styles.border} ${styles.effects} break-inside-avoid flex flex-col justify-between shadow-sm`}><div className="flex justify-between font-black text-[10px] uppercase mb-1 items-center gap-1"><span className="flex items-center gap-1.5 truncate"><span className="flex-shrink-0 text-stone-800">{styles.icon}</span> <span className="truncate text-stone-950">{rel.targetName}</span></span><span className={`${styles.text} whitespace-nowrap bg-white/50 px-1 rounded`}>{rel.score} • {rel.feeling}</span></div><p className="italic text-xs opacity-90 leading-tight font-serif text-stone-950 font-bold">"{rel.reason}"</p></div>);
                                    })}
                                 </div>
                              </div>
                           </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="page-break-before bg-stone-900 text-stone-100 p-12 border-8 border-double border-red-900 shadow-2xl relative overflow-visible break-inside-avoid"><h3 className="text-4xl font-bold medieval-font mb-6 text-red-500 flex items-center gap-3 border-none pb-0 uppercase tracking-tighter"><Skull className="w-12 h-12" /> The Black Secret</h3><p className="text-3xl italic font-serif leading-relaxed text-red-200">{village.darkSecret}</p><div className="absolute top-2 right-4 text-[10px] font-black uppercase tracking-[0.5em] opacity-30">Eyes Only</div></section>

            <section className="page-break-before print:print-page-border no-print:hidden break-inside-avoid h-auto overflow-visible"><h3 className="text-4xl font-bold medieval-font border-b-4 border-stone-800 mb-8 pb-4 uppercase tracking-wider"><BookOpen size={36} /> Campaign Chronicle</h3><div className="p-10 bg-white/40 border-4 border-dashed border-stone-400 rounded-sm h-auto min-h-[400px]"><textarea className="w-full h-full min-h-[400px] bg-transparent focus:ring-0 border-none italic text-2xl font-serif text-stone-950 font-bold leading-relaxed outline-none resize-none" placeholder="The chronicle of your deeds begins here..." value={editableNotes} onChange={(e) => setEditableNotes(e.target.value)} /></div></section>
          </div>
        </div>
      )}

      {loading && (<div className="fixed inset-0 bg-stone-900/95 z-50 flex items-center justify-center flex-col gap-6 p-12"><div className="relative"><Flame className="w-32 h-32 text-amber-500 animate-pulse" /><RefreshCw className="w-32 h-32 text-amber-600 animate-spin absolute top-0 left-0 opacity-20" /></div><h2 className="text-4xl medieval-font text-amber-500 text-center uppercase tracking-widest">Drafting the Dossier...</h2><p className="text-stone-400 italic text-center max-w-md text-lg">Weaving alliances, stocking the market, and unearthing deep-seated grudges across the Shadowdark.</p></div>)}
    </div>
  );
};

export default App;