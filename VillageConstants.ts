
export const ENCOUNTERS_DAY_INSIDE = [
  { who: "Pickpocket", text: "A nimble youth lifts a pouch from a PC." },
  { who: "Street Preacher", text: "A wild-eyed man screams of the 'Great Shadow'." },
  { who: "Stray Hound", text: "A scrawny dog follows, hoping for meat." },
  { who: "Suspicious Merchant", text: "Hooded figure offers elven silk suspiciously cheap." },
  { who: "Guard Patrol", text: "Two guards in rusted chain demand the party's business." },
  { who: "Orphan Beggar", text: "A child asks for a copper piece for bread." },
  { who: "Drunken Brawl", text: "Laborers spill out of a tavern, swinging clubs." },
  { who: "Runaway Cart", text: "A panicked mule pulls a cart through the street." },
  { who: "Hedge Witch", text: "Old woman offers to read fortune in brackish water." },
  { who: "Mysterious Package", text: "A ticking box is left on a doorstep." },
  { who: "Water Carrier", text: "Spills a bucket on the party's gear; checks for rust." },
  { who: "Rat Swarm", text: "A surge of rodents crosses the street in broad daylight." },
  { who: "Town Crier", text: "Shouts about a local execution scheduled for dusk." },
  { who: "Plague Cart", text: "Bell ringing, a man calls for the residents to bring out their dead." },
  { who: "Woodchopper", text: "Dragging a massive log that seems to be bleeding." },
  { who: "Statue of Loss", text: "A stone figure that seems to have moved." },
  { who: "Tax Collector", text: "Demands a 'gate fee' from the party." },
  { who: "Mourning Widow", text: "She clutches a PC's hand, mistaking them for kin." },
  { who: "Charismatic Bard", text: "Singing a song with secret details of a PC's past." },
  { who: "Sudden Deluge", text: "The sky opens; visibility drops significantly." }
];

export const ENCOUNTERS_NIGHT_INSIDE = [
  { who: "Roof Stalker", text: "A silhouette leaps between rooftops." },
  { who: "Muffled Scream", text: "A cry for help echoes from an alley." },
  { who: "Hooded Cultists", text: "Six figures carry a heavy, blood-stained sack." },
  { who: "Sleeping Sentry", text: "A guard is fast asleep against a rain barrel." },
  { who: "Giant Rat", text: "A massive rat with glowing eyes gnaws a bone." },
  { who: "The Night Watch", text: "A patrol with lanterns demands a night pass." },
  { who: "Lock-picker", text: "A thief is caught jemmying open a shop door." },
  { who: "Spectral Child", text: "A translucent girl chases a ghostly ball." },
  { who: "Ghoul", text: "A rubbery undead stalks the dark corners." },
  { who: "Choking Fog", text: "Thick yellow fog rolls in, smelling of sulfur." },
  { who: "Will-o'-Wisp", text: "Lures the curious into a deep sewer grate." },
  { who: "Panic Call", text: "A resident bolts from a house, screaming." },
  { who: "Howling Wind", text: "Blows out all non-magical torches for 1 round." },
  { who: "Scavenger", text: "A hunched figure collecting teeth from the gutter." },
  { who: "Assassin", text: "Waits in a doorway with a poisoned blade." },
  { who: "Street Dog swarm", text: "Hungry curs surround the party, snarling." },
  { who: "Grave Mist", text: "Cold vapor that slows movement." },
  { who: "Lost Drunk", text: "Stumbles into the party, smelling of bile." },
  { who: "Eerie Glow", text: "A green light flickers in a boarded window." },
  { who: "The Reaper", text: "A hooded figure points a bony finger at a PC." }
];

export const UNIQUE_MONSTERS = [
  "A patch of darkness detaches from a wall (Shadow).", "Rubbery-skinned undead dragging a limb (Ghoul).", "A massive rat with mangy fur (Giant Rat).", "Lumbering brute chewing on a raw horse leg (Ogre).", "A half-man, half-wolf predator (Werewolf).", "A puddle of acidic slime moving toward metal (Gray Ooze).", "Rattling bones rising from refuse (Skeleton).", "A bloated, water-logged corpse (Zombie).", "A green figure aiming a blowgun (Goblin).", "A hairy brute with a heavy mace (Bugbear).", "Ancient warrior with life-draining eyes (Wight).", "A mosquito-bird hybrid diving for a neck (Stirge).", "A massive arachnid dropping from a web (Giant Spider).", "A translucent horror that bypasses armor (Wraith).", "A rubbery-skinned giant with regeneration (Troll).", "A beast firing iron spikes from its tail (Manticore).", "An eight-legged lizard with a petrifying stare (Basilisk).", "A skeletal mage chanting necrotic words (Lich Apprentice).", "A towering brute looking for a snack (Hill Giant).", "A corrosive mass that splits when struck (Black Pudding).", "A multi-headed serpent with acidic breath (Hydra).", "A winged lion with a human face (Chimera).", "A floating eye with smaller eyestalks (Beholder Kin).", "A massive, armored toxic centipede (Giant Centipede).", "A creature disguised as a treasure chest (Mimic).", "A winged serpent that hums with static (Couatl).", "A heap of rotting vegetation moving (Shambling Mound).", "A creature made of living flame (Fire Elemental).", "A spirit bound to rusted plate (Animated Armor).", "A massive bear with an owl head (Owlbear).", "A tiny, mischievous demon (Imp).", "A half-man, half-bull with a great axe (Minotaur).", "A floating skull wreathed in green fire (Flameskull).", "A beautiful woman with snakes for hair (Medusa).", "A giant scorpion with a purple glowing stinger.", "A swarm of tiny, blood-drinking bats.", "A creature made of clay and dirt (Golem).", "A headless rider on a phantom steed (Dullahan).", "A massive, burrowing worm (Ankheg).", "A group of tiny aggressive lizardfolk (Kobolds).", "A woman with the lower body of a spider (Drider).", "A massive eagle with a 30-foot wingspan.", "A creature that looks like a man but has no face (Doppelganger).", "A floating entity with tentacles (Mind Flayer).", "A massive toad that can swallow a PC whole.", "A spirit that screams like dying men (Banshee).", "A group of small stone-eating creatures (Xorn).", "A massive multi-colored winged lizard (Wyvern).", "A creature of shadow that drains strength.", "A giant constrictor snake hiding in rafters.", "A rusted clockwork soldier clicking rhythmically.", "A group of primitives with bone spears.", "A massive crab with barnacle eyes.", "A floating jellyfish drifting through air (Gas Spore).", "A creature made of crawling insects.", "A man-sized moth with hypnotic patterns.", "A giant owl watching silently from a tree.", "A group of feral blue dwarfs (Dark Creepers).", "A massive elk with antlers of obsidian.", "A creature that mimics a crying baby.", "A swarm of glowing beetles that burn.", "A massive one-eyed giant throwing boulders (Cyclops).", "A spirit that possesses party shadows.", "A creature made of animated bloody chains.", "A giant intelligent raven speaking riddles.", "A group of cultists with masks of skin.", "A massive burrowing mole with iron claws.", "A floating translucent brain (Intellect Devourer).", "A creature looking like a heap of coins.", "A giant bat with a deafening sonar cry.", "A group of undead sailors with seawater.", "A massive white-furred ape (Yeti).", "A creature made of sharp jagged glass shards.", "A giant wasp with a dagger-sized stinger.", "A group of small imps that steal light (Darkmantle).", "A massive three-eyed poisonous toad.", "A spirit bound to a mirror showing death.", "A giant multi-colored humming centipede.", "A group of ghouls in wedding finery.", "A massive stone-skinned boar with tusks.", "A creature made of living pulsing shadows.", "A giant dragonfly that hovers silently.", "A group of small mechanical spiders.", "A massive white worm that breathes frost.", "A spirit looking like a lost loved one.", "A giant black wolf with glowing eyes.", "A group of skeletons playing rusted trumpets.", "A massive armored beetle spitting acid.", "A creature made of interlocking bones.", "A giant blue-skinned four-armed humanoid.", "A spirit that drains heat from the room.", "A giant translucent slug leaving salt trails.", "A group of tiny flying demons with teeth.", "A massive winged gargoyle like a statue.", "A creature with no body, only a head.", "A giant red-eyed salamander dripping lava.", "A spirit making a PC forget their name.", "A giant multi-legged lizard climbing walls.", "A group of zombies with an iron coffin.", "A massive ancient shadow swallowing light."
];

export const WEATHER_SPRING = ["Gentle drizzle.", "Heavy mist.", "Violent storm.", "Warm breeze.", "Freezing rain.", "Clear sky.", "Day-long downpour.", "Gusty winds.", "Chilling fog.", "Brief hail.", "Heavy humidity.", "Cool overcast.", "Light snow.", "Dry thunder.", "Dust devils.", "Low clouds.", "Rattling wind.", "Soft sun.", "Bitter snap.", "Silent air."];
export const WEATHER_SUMMER = ["Blistering heat.", "Dusty wind.", "Evening tempest.", "Sticky humidity.", "Heat haze.", "Refreshing shower.", "Static air.", "Drought breeze.", "Biting flies.", "Dust storm.", "River breeze.", "Blinding sun.", "Smoggy air.", "Midnight rain.", "Oppressive still.", "Earthquake thunder.", "Golden sunset.", "Cracking wind.", "Deluge.", "Unrelenting blue."];
export const WEATHER_FALL = ["Cold drizzle.", "Autumn gale.", "Morning frost.", "Crisp sun.", "Sodden mist.", "Driving rain.", "Whirling leaves.", "Damp humidity.", "Sudden sleet.", "Grey overcast.", "Mountain wind.", "Ghostly fog.", "Cold rain.", "Dying warmth.", "Gusts.", "Low clouds.", "Harsh wind.", "Muted sun.", "Temp drop.", "Heavy air."];
export const WEATHER_WINTER = ["Blizzard.", "Bone-chill cold.", "Silent snow.", "Frozen sleet.", "Grey sunless.", "Freezing fog.", "Arctic wind.", "Short light.", "Ice storm.", "Sub-zero.", "Cracking ice.", "Dark clouds.", "Biting wind.", "Heavy snow.", "Freezing rain.", "Leaden skies.", "Shatter frost.", "Icy mist.", "Powder snow.", "Knife wind."];
