//Refernce: https://stackoverflow.com/questions/17978720/invisible-characters-ascii

//Invisible characters that can be used to hide text in a message
export const specialChars = [
  "\u00AD", // Soft hyphen (may not be visible unless it appears at the end of a line)
  "\u061C", // Arabic Letter Mark (used to control text direction in Arabic script)
  "\u180E", // Mongolian vowel separator
  "\u200B", // Zero Width Space (invisible space)
  "\u200C", // Zero Width Non-Joiner (prevents characters from joining)
  "\u200D", // Zero Width Joiner (forces characters to join)
  "\u200E", // Left-to-Right Mark (LTR text direction)
  "\u200F", // Right-to-Left Mark (RTL text direction)
  "\u202A", // Start of Left-to-Right Embedding (used in bidirectional text)
  "\u202B", // Start of Right-to-Left Embedding (used in bidirectional text)
  "\u202C", // Pop Directional Formatting (closes bidirectional embeddings)
  "\u202D", // Left-to-Right Override (forces LTR direction for text)
  "\u202E", // Right-to-Left Override (forces RTL direction for text)
  "\u2060", // Word Joiner (prevents line breaks between words)
  "\u2061", // Function Application (used in mathematical expressions)
  "\u2062", // Invisible Times (used for mathematical expressions)
  "\u2063", // Invisible Separator (used for mathematical expressions)
  "\u2064", // Invisible Plus (used in mathematical expressions)
  "\u2067", // Right-to-Left Isolate (isolates RTL text)
  "\u2066", // Left-to-Right Isolate (isolates LTR text)
  "\u2068", // First Strong Isolate (isolates strong text)
  "\u2069", // Pop Directional Isolate (ends isolation)
  "\u206A", // Math Op (mathematical operator used in expressions)
  "\u206B", // Directional Format Override (forces direction of text)
  "\u206C", // Invisible Bidi Control (controls bidirectional text direction)
  "\u206D", // Invisible Right-to-Left Control (for RTL control)
  "\u206E", // Invisible Left-to-Right Control (for LTR control)
  "\u206F", // Invisible Fraction (used in fractions in text)
  "\uFEFF", // Zero Width No-Break Space (BOM - Byte Order Mark)
  "\u1D173", // Musical Symbol - Single Barline
  "\u1D174", // Musical Symbol - Double Barline
  "\u1D175", // Musical Symbol - End of Phrase
  "\u1D176", // Musical Symbol - Section
  "\u1D177", // Musical Symbol - Repeat Sign
  "\u1D178", // Musical Symbol - To Coda
  "\u1D179", // Musical Symbol - To End
  "\u1D17A", // Musical Symbol - Backward Repeat
  "\uE0001", // Language Tag (used to indicate language in text)
  "\uE0020", // Tag Space
  "\uE0021", // Tag Exclamation Mark
  "\uE0022", // Tag Quotation Mark
  "\uE0023", // Tag Number Sign
  "\uE0024", // Tag Dollar Sign
  "\uE0025", // Tag Percent Sign
  "\uE0026", // Tag Ampersand
  "\uE0027", // Tag Apostrophe
  "\uE0028", // Tag Left Parenthesis
  "\uE0029", // Tag Right Parenthesis
  "\uE002A", // Tag Asterisk
  "\uE002B", // Tag Plus Sign
  "\uE002C", // Tag Comma
  "\uE002D", // Tag Minus Sign
  "\uE002E", // Tag Period
  "\uE002F", // Tag Slash
  "\uE0030", // Tag Zero
  "\uE0031", // Tag One
  "\uE0032", // Tag Two
  "\uE0033", // Tag Three
  "\uE0034", // Tag Four
  "\uE0035", // Tag Five
  "\uE0036", // Tag Six
  "\uE0037", // Tag Seven
  "\uE0038", // Tag Eight
  "\uE0039", // Tag Nine
  "\uE003A", // Tag Colon
  "\uE003B", // Tag Semicolon
  "\uE003C", // Tag Less Than
  "\uE003D", // Tag Equals Sign
  "\uE003E", // Tag Greater Than
  "\uE003F", // Tag Question Mark
  "\uE0040", // Tag At Sign
  "\uE0041", // Tag A
  "\uE0042", // Tag B
  "\uE0043", // Tag C
  "\uE0044", // Tag D
  "\uE0045", // Tag E
  "\uE0046", // Tag F
  "\uE0047", // Tag G
  "\uE0048", // Tag H
  "\uE0049", // Tag I
  "\uE004A", // Tag J
  "\uE004B", // Tag K
  "\uE004C", // Tag L
  "\uE004D", // Tag M
  "\uE004E", // Tag N
  "\uE004F", // Tag O
  "\uE0050", // Tag P
  "\uE0051", // Tag Q
  "\uE0052", // Tag R
  "\uE0053", // Tag S
  "\uE0054", // Tag T
  "\uE0055", // Tag U
  "\uE0056", // Tag V
  "\uE0057", // Tag W
  "\uE0058", // Tag X
  "\uE0059", // Tag Y
  "\uE005A", // Tag Z
  "\uE005B", // Tag Left Square Bracket
  "\uE005C", // Tag Backslash
  "\uE005D", // Tag Right Square Bracket
  "\uE005E", // Tag Caret
  "\uE005F", // Tag Underscore
  "\uE0060", // Tag Grave Accent
  "\uE0061", // Tag a
  "\uE0062", // Tag b
  "\uE0063", // Tag c
  "\uE0064", // Tag d
  "\uE0065", // Tag e
  "\uE0066", // Tag f
  "\uE0067", // Tag g
  "\uE0068", // Tag h
  "\uE0069", // Tag i
  "\uE006A", // Tag j
  "\uE006B", // Tag k
  "\uE006C", // Tag l
  "\uE006D", // Tag m
  "\uE006E", // Tag n
  "\uE006F", // Tag o
  "\uE0070", // Tag p
  "\uE0071", // Tag q
  "\uE0072", // Tag r
  "\uE0073", // Tag s
  "\uE0074", // Tag t
  "\uE0075", // Tag u
  "\uE0076", // Tag v
  "\uE0077", // Tag w
  "\uE0078", // Tag x
  "\uE0079", // Tag y
  "\uE007A", // Tag z
  "\uE007B", // Tag Left Brace
  "\uE007C", // Tag Vertical Bar
  "\uE007D", // Tag Right Brace
  "\uE007E", // Tag Tilde
  "\uE007F", // Tag Delete (Control Character)
];
