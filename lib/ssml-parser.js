


var xmlNode = {
  name: '',
  attributes: '',
  children: []
};

var xmlAttribute = {
  name: '',
  value: ''
};

function parsessml(xmlStr) {
  
  var stream = new Stream(xmlStr);
  var lexer = new SSMLLexer(stream);

  var result = {
    declaration: {},
    children: []
  }

  result.declaration = parseDeclaration(lexer);

  while(lexer.peek().type !== TokenType.EOS) {
    var elt = parseElement(lexer);
    if (elt) {
      result.children.push(elt);
    } else {
      return false;
    }
  }

  return result;
}

function parseDeclaration(lexer) {
  var result = {
    name: "",
    attributes: []
  };
  
  var ltok = lexer.token();
  if (ltok.type !== TokenType.LT) {
    return false;
  }
  
  ltok = lexer.token();
  if (ltok.type !== TokenType.QTMARK) {
    return false;
  }

  ltok = lexer.token();
  if (ltok.type !== TokenType.IDENT) {
    return false;
  }
  result.name = ltok.value;

  while (lexer.peek().type !== TokenType.QTMARK) {
    // parse attributes
    var attr = parseAttribute(lexer);
    if (attr) {
      result.attributes.push(attr);
    } else {
      return false;
    }
  }
  // skip QTMARK
  ltok = lexer.token();
  // inspect next
  ltok = lexer.token();
  if (ltok.type !== TokenType.GT) {
    return false;
  }
    
  return result;
}

function parseAttribute(lexer) {
  var attr = {
    name: '',
    value: ''
  };
  var nameParts = [];

  var tok = lexer.token();
  if (tok.type !== TokenType.IDENT) return false;
  nameParts.push(tok.value);
  
  tok = lexer.token();
  if (tok.type === TokenType.COLON) {
    nameParts.push(tok.value);

    tok = lexer.token();
    if (tok.type !== TokenType.IDENT) return false;
    nameParts.push(tok.value);

  } else if (tok.type !== TokenType.EQUALS) {
    return false;
  }

  attr.name = nameParts.join("");
  
  tok = lexer.token();
  if (tok.type !== TokenType.QUOTE) return false;
  
  tok = lexer.token();
  if (tok.type !== TokenType.IDENT) return false;

  attr.value = tok.value;
  
  // TODO attribute value can have multiple identifiers

  tok = lexer.token();
  if (tok.type !== TokenType.QUOTE) return false;


  return attr;
}

function parseElement(lexer) {

}

window.parsessml = parsessml;


var TokenType = {
  EOS: 10,
  LT: 11,
  GT: 12,
  EQUALS: 13,
  QTMARK: 14,
  COLON: 15,
  FSLASH: 16,
  QUOTE: 17,
  IDENT: 18
};

var SSMLLexerToken = function() { 
  return {
    type: 0,
    value: '',
    start: 0,
    end: 0
  };
};

var SSMLLexer = function(stream) {
  this.stream = stream;
}

SSMLLexer.prototype.token = function() {
  var tr;
  if (this.stream.eos()) {
    // return EOS
    tr = new SSMLLexerToken();
    tr.type = TokenType.EOS;
    return tr;
  }

  this.stream.skipWhitespace();

  var tStart = this.stream.cpos;
  var cur = this.stream.current();

  while(!isWhitespace(cur) && !this.stream.eos()) {
    var ttype = 0;
    if (cur === "<") {
      // return LT
      ttype = TokenType.LT;
    }
    if (cur === ">") {
      // return GT
      ttype = TokenType.GT;
    }
    if (cur === "=") {
      // return EQUALS
      ttype = TokenType.EQUALS;
    }
    if (cur === "?") {
      // return QTMARK
      ttype = TokenType.QTMARK;
    }
    if (cur === ":") {
      // return COLON
      ttype = TokenType.COLON;
    }
    if (cur === "/") {
      // retun FSLASH
      ttype = TokenType.FSLASH;
    }
    if (cur === "\"") {
      // return QUOTE
      ttype = TokenType.QUOTE;
    }

    if (ttype) {
      if (this.stream.cpos - tStart === 0) {
        this.stream.next();
        tr = new SSMLLexerToken();
        tr.type = ttype;
        tr.start = tStart;
        tr.end = this.stream.cpos;
        tr.value = this.stream.token(tr.start, tr.end);
        ttype = 0;
        return tr;
      
      } else {
        tr = new SSMLLexerToken();
        tr.type = TokenType.IDENT;
        tr.start = tStart;
        tr.end = this.stream.cpos;
        tr.value = this.stream.token(tr.start, tr.end);
        ttype = 0;
        return tr;
      }
    }

    // advance the stream
    this.stream.next();
    cur = this.stream.current();
  }

  var tEnd = this.stream.cpos;
  var ident = this.stream.token(tStart, tEnd);

  // return IDENT
  tr = new SSMLLexerToken();
  tr.type = TokenType.IDENT;
  tr.start = tStart;
  tr.end = tEnd;
  tr.value = this.stream.token(tr.start, tr.end);
  return tr;
}

SSMLLexer.prototype.peek = function() {
  var prevPos = this.stream.cpos;
  var token = this.token();
  this.stream.cpos = prevPos;
  return token;
}


function isWhitespace(cur) {
  return cur === '\u0020' || cur === '\u0009' || cur === '\u000A' ||
    cur === '\u000C' || cur === '\u000D';
}


// 
// 
// 
// STREAM iplementation
// 
// 
// 

var Stream = function(str) {
  this.str = str;
  this.cpos = 0;
}

Stream.prototype.eos = function() {
  return this.cpos === this.str.length;
}

Stream.prototype.skipWhitespace = function() {
  var cur = this.str[this.cpos];
  while(isWhitespace(cur)) {
    this.cpos++;
    cur = this.str[this.cpos];
  }
}

Stream.prototype.current = function() {
  return this.str[this.cpos];
}

Stream.prototype.next = function() {
  this.cpos++;
}

Stream.prototype.token = function(begin, end) {
  return this.str.substring(begin, end);
}

// strip ssml function

window.stripSsml = stripSsml;

function stripSsml(ssmlStr) {
  var result = [];
  
  var indexOfLt = ssmlStr.indexOf('<');

  if (indexOfLt === -1) return result;

  var indexOfGt = 0;

  while(indexOfLt > -1) {

    subResult = ssmlStr.substring(indexOfGt, indexOfLt);
    result.push(subResult);

    indexOfGt = ssmlStr.indexOf('>', indexOfLt);

    if (indexOfGt === -1) break;
    indexOfGt += 1;
    
    indexOfLt = ssmlStr.indexOf('<', indexOfGt);
  }

  if (indexOfGt < ssmlStr.length) {
    var lastPart = ssmlStr.substring(indexOfGt);
    result.push(lastPart);
  }

  result = result.join(" ");
  return result;
}




