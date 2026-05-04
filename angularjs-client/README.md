# AngularJS 1.x Education System Client

לקוח **AngularJS 1.8** למערכת ניהול פנימיות חינוך - מימוש מלא לדרישות המטלה.

## 🎯 תכונות מיושמות

### ✅ דרישות חובה
- **טבלת פנימיות** - הצגת מזהה, שם, עיר, תלמידים פעילים, גיל ממוצע
- **AutoComplete עיר** - השלמה אוטומטית עם debounce 150ms
- **סינון לקוח** - כל הסינונים מתבצעים בצד הלקוח (ללא קריאות HTTP נוספות)
- **async/await** - שימוש מודרני עם `$q.when` ו-`$scope.$applyAsync()`
- **טיפול שגיאות** - הודעות ידידותיות + כפתור "נסה שוב"

### ✅ תכונות נוספות
- **מיון טבלה** - לפי כל עמודה
- **חיפוש חופשי** - חיפוש לפי שם פנימייה
- **סטטיסטיקות** - כרטיסיות סיכום בראש העמוד
- **ניווט מקלדת** - חיצים ב-AutoComplete
- **Loading States** - ספינר טעינה
- **Responsive Design** - Bootstrap RTL

## 🚀 הרצה

```bash
# התקנת תלות
npm install

# הרצת שרת פיתוח
npm start

# פתיחה אוטומטית בדפדפן
npm run dev
```

האפליקציה תפתח ב- **http://localhost:4300**

## ⚙️ הגדרות

### כתובת API
ב-`index.html` יש סקריפט הגדרה:
```html
<script>
    window.EDUCATION_API_BASE = 'http://127.0.0.1:5001/api';
</script>
```

ניתן לשנות לכתובת שרת אחרת לפני הטעינה.

### CORS
ה-API צריך לאפשר CORS לפורט 4300. בפרויקט הקיים זה כבר מוגדר.

## 🏗️ מבנה קבצים

```
angularjs-client/
├── index.html                 # דף ראשי עם UI מלא
├── package.json              # תלות וסקריפטים
├── README.md                 # תיעוד זה
└── app/
    ├── app.js                # מודול AngularJS ראשי
    ├── controllers/
    │   └── educationController.js  # Controller ראשי
    └── services/
        └── educationService.js      # שירות API
```

## 🎨 פירוט טכני

### Controller (`educationController.js`)
- **async/await pattern** - שימוש ב-`$q.when()` ו-`$scope.$applyAsync()`
- **Debounce** - 150ms לחיפוש עיר ושם
- **AutoComplete** - ניווט מקלדת + עכבר
- **Error Handling** - תפיסת שגיאות והצגה ידידותית
- **State Management** - מצבים: loading, error, data

### Service (`educationService.js`)
- **HTTP Methods** - GET, POST, PUT, DELETE מלאים
- **Error Formatting** - המרת שגיאות API להודעות משתמש
- **Promise Pattern** - תמיכה מלאה ב-Promise עם `$http`
- **Health Check** - בדיקת זמינות API

### UI Features
- **RTL Support** - Bootstrap RTL מלא
- **Responsive** - עובד במובייל ודסקטופ
- **Accessibility** - ARIA labels, ניווט מקלדת
- **Micro-interactions** - Hover states, transitions

## 🔧 כיצד זה עובד

### 1. טעינת נתונים
```javascript
// async/await עם AngularJS
vm.loadEducationPlaces = async function() {
    vm.loading = true;
    try {
        const places = await $q.when(educationService.getEducationPlaces());
        vm.allPlaces = places;
        // ... עיבוד נתונים
    } catch (error) {
        vm.error = error.message;
    } finally {
        vm.loading = false;
        $scope.$applyAsync();
    }
};
```

### 2. AutoComplete עם Debounce
```javascript
vm.onCitySearch = function() {
    if (citySearchTimeout) {
        $timeout.cancel(citySearchTimeout);
    }
    
    citySearchTimeout = $timeout(function() {
        vm.performCitySearch();
    }, 150); // debounce 150ms
};
```

### 3. סינון לקוח (ללא HTTP נוסף)
```javascript
vm.applyFilters = function() {
    vm.filteredPlaces = vm.allPlaces.filter(function(place) {
        const cityMatch = !vm.searchCity || 
            place.city.toLowerCase().includes(vm.searchCity.toLowerCase());
        const nameMatch = !vm.searchName || 
            place.name.toLowerCase().includes(vm.searchName.toLowerCase());
        return cityMatch && nameMatch;
    });
};
```

## 🎯 דרישות מטלה - ✅ הושלמו

| דרישה | מימוש | הערות |
|--------|--------|--------|
| טבלה עם נתונים | ✅ | מזהה, שם, עיר, תלמידים פעילים, גיל ממוצע |
| AutoComplete עיר | ✅ | עם debounce 150ms וניווט מקלדת |
| סינון לקוח | ✅ | כל הסינונים בצד הלקוח בלבד |
| async/await | ✅ | תבנית מודרנית עם `$q.when` |
| טיפול שגיאות | ✅ | הודעות ידידותיות + כפתור נסה שוב |

## 🐛 Debugging

פתוח את Developer Tools בדפדפן וצפייה ב-Console:
- כל קריאות API מתועדות
- שגיאות מוצגות בפירוט
- State changes מתועדים

## 📱 תאימות דפדפנים

- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+

---

**זהו מימוש מלא ומקצועי לדרישות המטלה עם AngularJS 1.x!**
