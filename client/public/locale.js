// stateful ennit
function localeString(code)
{
    let strings = JSON.parse(localStorage.getItem('locale-strings'));
    let whatstring = strings[code];
    if (!whatstring || whatstring == '') whatstring = strings['en'];
    let locale = whatstring[localStorage.getItem('locale')];
        
    return locale;
}

function switchLocale(locale)
{
    localStorage.setItem('locale', locale);
    location.reload();
}

async function loadLoacale()
{
    const res = await fetch('/locales', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
    });
    localStorage.setItem('locale-strings', await res.text());
}

loadLoacale();
if (localStorage.getItem('locale') == null)
{
    localStorage.setItem('locale', 'en');
    location.reload();
}
