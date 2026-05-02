import { type InsertRestaurant, type InsertSpecial } from "@shared/schema";
import { addDays, startOfWeek } from "date-fns";

export function getChappaquaRestaurants(): InsertRestaurant[] {
  return [
    {
      name: "Basso by PXK",
      cuisine: "italian",
      description: "Contemporary Italian cuisine by Chef Peter X. Kelly. Known for fresh pasta, seasonal ingredients, and an extensive wine list in an elegant setting.",
      address: "11 King Street, Chappaqua, NY",
      phone: "(914) 238-8600",
      website: "https://bassobypxk.com/",
      priceRange: "$$$",
      hours: "Tue-Sun 5-10pm, Brunch Sun 11:30am-2:30pm",
      imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80",
    },
    {
      name: "The Kittle House Inn & Restaurant",
      cuisine: "american",
      description: "Historic farm-to-table dining in a restored 1790s inn. Wine Spectator award winner featuring locally sourced ingredients and scenic garden views.",
      address: "11 Kittle Road, Chappaqua, NY",
      phone: "(914) 666-8044",
      website: "https://www.thekittlehouseinn.com/",
      priceRange: "$$$$",
      hours: "Tue-Sat 5:30-9pm, Sun Brunch 11am-2pm",
      imageUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80",
    },
    {
      name: "Ibiza Kitchen",
      cuisine: "spanish",
      description: "Authentic Spanish tapas and paella in a warm, inviting atmosphere. Extensive selection of Spanish wines and traditional dishes from the Iberian coast.",
      address: "76 King Street, Chappaqua, NY",
      phone: "(914) 238-7220",
      website: "https://www.ibiza-kitchenny.com/",
      priceRange: "$$$",
      hours: "Tue-Thu 5-9:30pm, Fri-Sat 5-10pm, Sun 5-9pm",
      imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80",
    },
    {
      name: "Quaker Hill Tavern",
      cuisine: "american",
      description: "Family-friendly neighborhood tavern serving classic American comfort food. A local favorite for casual dining with a welcoming atmosphere.",
      address: "61 North Bedford Road, Chappaqua, NY",
      phone: "(914) 238-9925",
      website: "https://quakerhilltavern.net/",
      priceRange: "$$",
      hours: "Mon-Sun 11:30am-10pm",
      imageUrl: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=600&q=80",
    },
    {
      name: "Le Jardin du Roi",
      cuisine: "french",
      description: "French bistro with a twist. Award-winning BBQ meets French cuisine with all-day breakfast options and garden seating.",
      address: "95 King Street, Chappaqua, NY",
      phone: "(914) 238-1368",
      website: "https://lejardinchappaqua.com/",
      priceRange: "$$",
      hours: "Mon-Sat 8am-9pm, Sun 8am-4pm",
      imageUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80",
    },
    {
      name: "Bia American Kitchen",
      cuisine: "american",
      description: "Modern American cuisine featuring seasonal menus, craft cocktails, and a contemporary dining experience in the heart of Chappaqua.",
      address: "King Street, Chappaqua, NY",
      phone: "(914) 238-2424",
      website: "https://biaamericankitchen.com/",
      priceRange: "$$",
      hours: "Tue-Sun 5-10pm",
      imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80",
    },
    {
      name: "Mentor's Mediterranean Steakhouse",
      cuisine: "mediterranean",
      description: "Upscale Mediterranean dining featuring prime dry-aged steaks and fresh seafood with Piedmont influences. Perfect for special occasions.",
      address: "Chappaqua, NY",
      phone: "(914) 238-9600",
      priceRange: "$$$$",
      hours: "Wed-Sun 5-10pm",
      imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80",
    },
    {
      name: "Chappaqua Deli & Cafe",
      cuisine: "cafe",
      description: "Local favorite for breakfast sandwiches, fresh deli options, and quick lunch. Great coffee and friendly service.",
      address: "50 South Greeley Avenue, Chappaqua, NY",
      phone: "(914) 238-3232",
      priceRange: "$",
      hours: "Mon-Sat 6am-4pm, Sun 7am-3pm",
      imageUrl: "https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=600&q=80",
    },
  ];
}

export function getRestaurantSpecials(restaurantIds: Map<string, string>): InsertSpecial[] {
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 0 });
  
  const specials: InsertSpecial[] = [];
  
  const bassoId = restaurantIds.get("Basso by PXK");
  if (bassoId) {
    specials.push(
      {
        restaurantId: bassoId,
        title: "Sunday Bellini Brunch",
        description: "Enjoy $5 Bellinis with our Sunday brunch menu. Fresh-made pasta, eggs benedict, and seasonal specialties.",
        type: "brunch",
        price: "$5 Bellinis",
        daysAvailable: "Sundays 11:30am - 2:30pm",
        isActive: true,
      },
      {
        restaurantId: bassoId,
        title: "Weekly Pasta Feature",
        description: "Chef's special handmade pasta dish changes weekly. This week: Pappardelle with Wild Boar Ragu.",
        type: "weekly",
        validFrom: weekStart,
        validTo: addDays(weekStart, 6),
        isActive: true,
      }
    );
  }
  
  const kittleId = restaurantIds.get("The Kittle House Inn & Restaurant");
  if (kittleId) {
    specials.push(
      {
        restaurantId: kittleId,
        title: "Holiday Prix Fixe Menu",
        description: "Celebrate the season with our special 4-course holiday menu featuring roasted duck, prime rib, and festive desserts.",
        type: "holiday",
        price: "$95 per person",
        validFrom: addDays(weekStart, -7),
        validTo: addDays(weekStart, 21),
        isActive: true,
      },
      {
        restaurantId: kittleId,
        title: "Wine Pairing Dinner",
        description: "Monthly wine dinner featuring wines from our award-winning cellar paired with seasonal dishes. Reservations required.",
        type: "weekly",
        price: "$125 per person",
        daysAvailable: "First Thursday of each month",
        isActive: true,
      }
    );
  }
  
  const ibizaId = restaurantIds.get("Ibiza Kitchen");
  if (ibizaId) {
    specials.push(
      {
        restaurantId: ibizaId,
        title: "Tapas Tuesday",
        description: "All tapas plates 20% off. Perfect for sharing! Try our patatas bravas, gambas al ajillo, and chorizo a la sidra.",
        type: "weekly",
        price: "20% off tapas",
        daysAvailable: "Tuesdays 5-9pm",
        isActive: true,
      },
      {
        restaurantId: ibizaId,
        title: "Happy Hour Sangria",
        description: "House-made red or white sangria by the pitcher. Served with complimentary olives and marcona almonds.",
        type: "happy-hour",
        price: "$25 pitcher",
        daysAvailable: "Tue-Fri 5-6:30pm",
        isActive: true,
      }
    );
  }
  
  const quakerId = restaurantIds.get("Quaker Hill Tavern");
  if (quakerId) {
    specials.push(
      {
        restaurantId: quakerId,
        title: "Kids Eat Free Monday",
        description: "Kids 12 and under eat free with purchase of adult entree. Valid for kids menu items only.",
        type: "weekly",
        price: "Free kids meal",
        daysAvailable: "Mondays 4-8pm",
        isActive: true,
      },
      {
        restaurantId: quakerId,
        title: "Wing Wednesday",
        description: "Half-price wings all day! Choose from Buffalo, BBQ, Garlic Parmesan, or Honey Sriracha.",
        type: "weekly",
        price: "50% off wings",
        daysAvailable: "Wednesdays all day",
        isActive: true,
      }
    );
  }
  
  const leJardinId = restaurantIds.get("Le Jardin du Roi");
  if (leJardinId) {
    specials.push(
      {
        restaurantId: leJardinId,
        title: "Weekend Brunch",
        description: "French-inspired brunch with bottomless mimosas. Featuring croissant French toast, eggs florentine, and quiche du jour.",
        type: "brunch",
        price: "$35 with bottomless mimosas",
        daysAvailable: "Sat-Sun 9am-2pm",
        isActive: true,
      },
      {
        restaurantId: leJardinId,
        title: "Holiday Yule Log Pre-Order",
        description: "Pre-order our famous Buche de Noel for the holidays. Traditional chocolate or chestnut cream available.",
        type: "holiday",
        price: "$45",
        validFrom: weekStart,
        validTo: addDays(weekStart, 21),
        isActive: true,
      }
    );
  }
  
  const biaId = restaurantIds.get("Bia American Kitchen");
  if (biaId) {
    specials.push(
      {
        restaurantId: biaId,
        title: "Date Night Special",
        description: "Two entrees, shared appetizer, and bottle of house wine. Perfect for a romantic evening out.",
        type: "weekly",
        price: "$89 for two",
        daysAvailable: "Thu-Sat",
        isActive: true,
      },
      {
        restaurantId: biaId,
        title: "Happy Hour",
        description: "$8 craft cocktails and half-price appetizers at the bar. Try our signature Old Fashioned or seasonal martini.",
        type: "happy-hour",
        price: "$8 cocktails",
        daysAvailable: "Tue-Fri 5-7pm",
        isActive: true,
      }
    );
  }
  
  const mentorsId = restaurantIds.get("Mentor's Mediterranean Steakhouse");
  if (mentorsId) {
    specials.push(
      {
        restaurantId: mentorsId,
        title: "Prime Rib Friday",
        description: "Slow-roasted prime rib with Yorkshire pudding, creamed spinach, and horseradish cream. Limited availability.",
        type: "weekly",
        price: "$65",
        daysAvailable: "Fridays only",
        isActive: true,
      },
      {
        restaurantId: mentorsId,
        title: "New Year's Eve Celebration",
        description: "Ring in 2025 with our special 5-course celebration menu. Champagne toast at midnight included.",
        type: "holiday",
        price: "$175 per person",
        validFrom: addDays(weekStart, 21),
        validTo: addDays(weekStart, 24),
        isActive: true,
      }
    );
  }
  
  const deliId = restaurantIds.get("Chappaqua Deli & Cafe");
  if (deliId) {
    specials.push(
      {
        restaurantId: deliId,
        title: "Early Bird Coffee Special",
        description: "Large coffee and breakfast sandwich combo. Start your day right with our fresh-baked rolls.",
        type: "weekly",
        price: "$6.99",
        daysAvailable: "Mon-Fri 6-8am",
        isActive: true,
      }
    );
  }
  
  return specials;
}
