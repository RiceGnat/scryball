# Scryball
Discord bot to look up cards using [Scryfall](https://scryfall.com/)'s [API](https://scryfall.com/docs/api).

Add the bot: https://discord.com/api/oauth2/authorize?client_id=940495451013120072&permissions=379904&scope=applications.commands%20bot

## Commands
All commands use Discord [slash commands](https://discord.com/blog/slash-commands-are-here).
#### Card image
```
/card name:[cardname]
```
Double-faced cards will display as grouped embeds (will not display correctly on mobile).

#### Oracle text
```
/oracle name:[cardname]
```
Requires **external emojis** permission to display correctly.

#### Card prices
```
/price name:[cardname]
```
Gets TCGPlayer prices as reported by Scryfall.
