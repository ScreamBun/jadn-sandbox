import JSONInput from 'react-json-editor';
import { format } from 'react-json-editor/dist/locale';
import defaultLocale from 'react-json-editor/dist/locale/en';
import {
  // Helpers
  countCarrigeReturn, isFunction, mergeObjects, safeGet,
  // Helpers/Interfaces
  DomNode, Placeholder, Tokens
} from 'react-json-editor/dist/utils';

// import { DomNode_Update, JSON_Placeholder } from '/tokenize';

class JADNInput extends JSONInput {
  tokenizeDomNode(obj: HTMLDivElement): null|DomNode.DomNodeTokenize {
    const { locale } = this.props;
    const lang = locale || defaultLocale;
    const containerNode = obj.cloneNode(true);
    if (!containerNode.hasChildNodes()) {
      return null;
    }

    const children = containerNode.childNodes;
    const buffer: DomNode.PrimaryBuffer = {
      tokens_unknown: [],
      tokens_proto: [],
      tokens_split: [],
      tokens_fallback: [],
      tokens_normalize: [],
      tokens_merge: [],
      tokens_plainText: '',
      indented: '',
      json: '',
      jsObject: {},
      markup: ''
    };

    const setChildToken = (child: ChildNode): void => {
      switch (child.nodeName) {
        case 'SPAN':
          const { dataset } = (child as HTMLDivElement);
          buffer.tokens_unknown.push({
            string: child.textContent || '',
            type: dataset.type || 'unknown'  // child.attributes.type.textContent
          } as Tokens.SimpleToken);
          break;
        case 'DIV':
          child.childNodes.forEach(c => setChildToken(c));
          buffer.tokens_unknown.push({
            string: '\n',
            type: 'unknown'
          } as Tokens.SimpleToken);
          break;
        case 'BR':
          if (child.textContent === '') {
            buffer.tokens_unknown.push({
              string: '\n',
              type: 'unknown'
            } as Tokens.SimpleToken);
          }
          break;
        case '#text':
          buffer.tokens_unknown.push({
            string: child.textContent || '',  // child.wholeText,
            type: 'unknown'
          } as Tokens.SimpleToken);
          break;
        case 'FONT':
          buffer.tokens_unknown.push({
            string: child.textContent || '',
            type: 'unknown'
          } as Tokens.SimpleToken);
          break;
        default:
          console.error('Unrecognized node:', { child });
      }
    };

    children.forEach(child => setChildToken(child));

    buffer.tokens_proto = buffer.tokens_unknown.map(token => DomNode.quarkize(token.string, 'proto')).reduce((all, quarks) => all.concat(quarks));

    buffer.tokens_proto.forEach(token => {
      if (!token.type.includes('proto')) {
        if (!DomNode.validToken(token.string, token.type as Tokens.TokenType)) {
          buffer.tokens_split = buffer.tokens_split.concat(DomNode.quarkize(token.string, 'split'));
        } else {
          buffer.tokens_split.push(token);
        }
      } else {
        buffer.tokens_split.push(token);
      }
    });

    buffer.tokens_fallback = buffer.tokens_split.map<Tokens.FallbackToken>(token => {
      const fallback = [];
      let { type } = token;

      if (type.includes('-')) {
        type = type.slice(type.indexOf('-') + 1);
        if (type !== 'string') {
          fallback.push('string');
        }
        fallback.push('key');
        fallback.push('error');
      }
      return {
        string: token.string,
        length: token.string.length,
        fallback,
        type
      } as Tokens.FallbackToken;
    });

    const buffer2: DomNode.SecondaryBuffer = {
      brackets: [],
      isValue: false,
      stringOpen: false
    };

    // Sort tokens for push -> buffer.tokens_normalize
    for (let i = 0; i < buffer.tokens_fallback.length; i++) {
      const token = buffer.tokens_fallback[i];
      const lastIndex = buffer.tokens_normalize.length - 1;
      const lastType = safeGet(Tokens.tokenFollowed(buffer.tokens_normalize) || {}, 'type', 'string') as Tokens.TokenType;
      const normalToken = {
        string: token.string,
        type: token.type
      };

      switch (normalToken.type) {
        case 'symbol':
        case 'colon':
          if (buffer2.stringOpen) {
            normalToken.type = buffer2.isValue ? 'string' : 'key';
            break;
          }
          switch (normalToken.string) {
            case '[':
            case '{':
              buffer2.brackets.push(normalToken.string);
              buffer2.isValue = buffer2.brackets[buffer2.brackets.length-1] === '[';
              break;
            case ']':
            case '}':
              buffer2.brackets.pop();
              buffer2.isValue = buffer2.brackets[buffer2.brackets.length-1] === '[';
              break;
            case ',':
              if (lastType === 'colon') {
                break;
              }
              buffer2.isValue = buffer2.brackets[buffer2.brackets.length-1] === '[';
              break;
            case ':':
              normalToken.type = 'colon';
              buffer2.isValue = true;
              break;
            // no default
          }
          break;
        case 'delimiter':
          normalToken.type = buffer2.isValue ? 'string' : 'key';
          if (!buffer2.stringOpen) {
            buffer2.stringOpen = normalToken.string;
            break;
          }
          if (i > 0) {
            const prevToken = Tokens.precedingToken(buffer.tokens_fallback, i) || {};
            const prevTokenString = safeGet(prevToken, 'string', '') as string;
            const prevTokenType = safeGet(prevToken, 'type', '') as Tokens.TokenType;
            const prevTokenChar = prevTokenString.charAt(prevTokenString.length - 1);
            if (prevTokenType === 'string' && prevTokenChar === '\\') {
              break;
            }
          }
          if (buffer2.stringOpen === normalToken.string) {
            buffer2.stringOpen = false;
            break;
          }
          break;
        case 'primitive':
        case 'string':
          if (['false', 'true', 'null', 'undefined'].includes(normalToken.string)) {
            if (lastIndex >= 0) {
              if (buffer.tokens_normalize[lastIndex].type !== 'string') {
                normalToken.type = 'primitive';
                break;
              }
              normalToken.type = 'string';
              break;
            }
            normalToken.type = 'primitive';
            break;
          }
          if (normalToken.string === '\n' && !buffer2.stringOpen) {
            normalToken.type = 'linebreak';
            break;
          }
          normalToken.type = buffer2.isValue ? 'string' : 'key';
          break;
        case 'space':
        case 'number':
          if (buffer2.stringOpen) {
            normalToken.type = buffer2.isValue ? 'string' : 'key';
          }
          break;
        // no default
      }
      buffer.tokens_normalize.push(normalToken);
    }

    // Sort tokens for push -> buffer.tokens_merge
    for (let i = 0; i < buffer.tokens_normalize.length; i++) {
      const token = buffer.tokens_normalize[i];
      const mergedToken: Tokens.MergeToken = {
        string: token.string,
        tokens: [i],
        type: token.type
      };

      if (!['symbol', 'colon'].includes(token.type) && i + 1 < buffer.tokens_normalize.length) {
        let count = 0;
        for (let u = i + 1; u < buffer.tokens_normalize.length; u++) {
          const nextToken = buffer.tokens_normalize[u];
          if (token.type !== nextToken.type) {
            break;
          }
          mergedToken.string += nextToken.string;
          mergedToken.tokens.push(u);
          count += 1;
        }
        i += count;
      }
      buffer.tokens_merge.push(mergedToken);
    }

    const alphanumeric = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_$';
    const bracketList: Array<DomNode.Bracket> = [];
    const quotes = '\'"';
    let errorMsg: undefined|Tokens.ErrorMsg;
    let line = buffer.tokens_merge.length > 0 ? 1 : 0;

    // Reset Buffer2
    buffer2.brackets = [];
    buffer2.isValue = false;
    buffer2.stringOpen = false;

    const setError = (tokenID: number, reason: string, offset = 0): void => {
      errorMsg = {
        token: tokenID,
        line,
        reason
      };
      buffer.tokens_merge[tokenID+offset].type = 'error';
    };

    // TODO: Simplify loop
    for (let i = 0; i < buffer.tokens_merge.length; i++) {
      if (errorMsg) {
        break;
      }
      const token = buffer.tokens_merge[i];
      let { string, type } = token;
      let found = false;

      switch (type) {
        case 'space':
          break;
        case 'linebreak':
          line += 1;
          break;
        case 'symbol':
          switch (string) {
            case '{':
            case '[':
              found = Tokens.followsSymbol(buffer.tokens_merge, i, ['}', ']']);
              if (found) {
                setError(i, format(lang.invalidToken.tokenSequence.prohibited, {
                  firstToken: buffer.tokens_merge[i].string,  // TODO: should `i` be `found`??
                  secondToken: string
                }));
                break;
              }
              if (string === '[' && i > 0) {
                if (!Tokens.followsSymbol(buffer.tokens_merge, i, [':', '[', ','])) {
                  setError(i, format(lang.invalidToken.tokenSequence.permitted, {
                    firstToken: '[',
                    secondToken: [':', '[', ',']
                  }));
                  break;
                }
              }
              if (string === '{') {
                if (Tokens.followsSymbol(buffer.tokens_merge, i, ['{'])) {
                  setError(i, format(lang.invalidToken.double, {
                    token: '{'
                  }));
                  break;
                }
              }
              buffer2.brackets.push(string);
              buffer2.isValue = buffer2.brackets[buffer2.brackets.length-1] === '[';
              bracketList.push({ i, line, string });
              break;
            case '}':
            case ']':
              if (string === '}') {
                if (buffer2.brackets[buffer2.brackets.length-1] !== '{') {
                  setError(i, format(lang.brace.curly.missingOpen));
                  break;
                }
                if (Tokens.followsSymbol(buffer.tokens_merge, i, [','])) {
                  setError(i, format(lang.invalidToken.tokenSequence.prohibited, {
                    firstToken: ',',
                    secondToken: '}'
                  }));
                  break;
                }
              }
              if (string === ']') {
                if (buffer2.brackets[buffer2.brackets.length-1] !== '[') {
                  setError(i, format(lang.brace.square.missingOpen));
                  break;
                }
                if (Tokens.followsSymbol(buffer.tokens_merge, i, [':'])) {
                  setError(i, format(lang.invalidToken.tokenSequence.prohibited, {
                    firstToken: ':',
                    secondToken: ']'
                  }));
                  break;
                }
              }
              buffer2.brackets.pop();
              buffer2.isValue = buffer2.brackets[buffer2.brackets.length-1] === '[';
              bracketList.push({ i, line, string });
              break;
            case ',':
              found = Tokens.followsSymbol(buffer.tokens_merge, i, ['{']);
              if (found) {
                if (Tokens.followedBySymbol(buffer.tokens_merge, i, ['}'])) {
                  setError(i, format(lang.brace.curly.cannotWrap, {
                    token: ','
                  }));
                  break;
                }
                setError(i, format(lang.invalidToken.tokenSequence.prohibited, {
                  firstToken: '{',
                  secondToken: ','
                }));
                break;
              }
              if (Tokens.followedBySymbol(buffer.tokens_merge, i, ['}', ',', ']'])) {
                setError(i, format(lang.noTrailingOrLeadingComma));
                break;
              }
              const typeFollow = Tokens.typeFollowed(buffer.tokens_merge, i);
              switch (typeFollow) {
                case 'key':
                case 'colon':
                  setError(i, format(lang.invalidToken.termSequence.prohibited, {
                    firstTerm: typeFollow === 'key' ? lang.types.key : lang.symbols.colon,
                    secondTerm: lang.symbols.comma
                  }));
                  break;
                case 'symbol':
                  if (Tokens.followsSymbol(buffer.tokens_merge, i, ['{'])) {
                    setError(i, format(lang.invalidToken.tokenSequence.prohibited, {
                      firstToken: '{',
                      secondToken: ','
                    }));
                    break;
                  }
                  break;
                // no default
              }
              buffer2.isValue = buffer2.brackets[buffer2.brackets.length-1] === '[';
              break;
            // no default
          }
          buffer.json += string;
          break;
        case 'colon':
          found = Tokens.followsSymbol(buffer.tokens_merge, i, ['[']);
          if (found) {
            if (Tokens.followedBySymbol(buffer.tokens_merge, i, [']'])) {
              setError(i, format(lang.brace.square.cannotWrap, {
                token: ':'
              }));
              break;
            }
            setError(i, format(lang.invalidToken.tokenSequence.prohibited, {
              firstToken: '[',
              secondToken: ':'
            }));
            break;
          }
          if (Tokens.typeFollowed(buffer.tokens_merge, i) !== 'key') {
            setError(i, format(lang.invalidToken.termSequence.permitted, {
              firstTerm: lang.symbols.colon,
              secondTerm: lang.types.key
            }));
            break;
          }
          if (Tokens.followedBySymbol(buffer.tokens_merge, i, ['}', ']'])) {
            setError(i, format(lang.invalidToken.termSequence.permitted, {
              firstTerm: lang.symbols.colon,
              secondTerm: lang.types.value
            }));
            break;
          }
          buffer2.isValue = true;
          buffer.json += string;
          break;
        case 'key':
        case 'string':
          const firstChar = string.charAt(0);
          const lastChar = string.charAt(string.length-1);
          if (!quotes.includes(firstChar)) {
            if (quotes.includes(lastChar)) {
              setError(i, format(lang.string.missingOpen, {
                quote: firstChar
              }));
              break;
            }
          }
          if (!quotes.includes(lastChar)) {
            if (quotes.includes(firstChar)) {
              setError(i, format(lang.string.missingClose, {
                quote: firstChar
              }));
              break;
            }
          }
          if (quotes.includes(firstChar)) {
            if (firstChar !== lastChar) {
              setError(i, format(lang.string.missingClose, {
                quote: firstChar
              }));
              break;
            }
          }
          if (type === 'string') {
            if (!quotes.includes(firstChar) && !quotes.includes(lastChar)) {
              setError(i, format(lang.string.mustBeWrappedByQuotes));
              break;
            }
          }
          if (type === 'key') {
            if (Tokens.followedBySymbol(buffer.tokens_merge, i, ['}', ']'])) {
              setError(i, format(lang.invalidToken.termSequence.permitted, {
                firstTerm: lang.types.key,
                secondTerm: lang.symbols.colon
              }));
            }
          }
          if (!quotes.includes(firstChar) && !quotes.includes(lastChar)) {
            for (let h = 0; h < string.length; h++) {
              if (errorMsg) {
                break;
              }
              const c = string.charAt(h);
              if (!alphanumeric.includes(c)) {
                setError(i, format(lang.string.nonAlphanumeric, {
                  token: c
                }));
                break;
              }
            }
          }
          if (type === 'key') {
            if (Tokens.typeFollowed(buffer.tokens_merge, i) === 'key') {
              if (i > 0) {
                if (!Number.isNaN(Number(buffer.tokens_merge[i-1]))) {
                  mergeObjects(buffer.tokens_merge[i-1], buffer.tokens_merge[i]);
                  setError(i, format(lang.key.numberAndLetterMissingQuotes));
                  break;
                }
              }
              setError(i, format(lang.key.spaceMissingQuotes));
              break;
            }
            if (!Tokens.followsSymbol(buffer.tokens_merge, i, ['{', ','])) {
              setError(i, format(lang.invalidToken.tokenSequence.permitted, {
                firstToken: type,
                secondToken: ['{', ',']
              }));
              break;
            }
          }
          if (type === 'string') {
            if (!Tokens.followsSymbol(buffer.tokens_merge, i, ['[', ':', ','])) {
              setError(i, format(lang.invalidToken.tokenSequence.permitted, {
                firstToken: type,
                secondToken: ['[', ':', ',']
              }));
              break;
            }
          }
          if (type === 'key' && buffer2.isValue) {
            setError(i, format(lang.string.unexpectedKey));
            break;
          }
          if (type === 'string' && !buffer2.isValue) {
            setError(i, format(lang.key.unexpectedString));
            break;
          }
          if (firstChar === "'") {
            string = `"${string.slice(1, -1)}"`;
          } else if (firstChar !== '"') {
            string = `"${string}"`;
          }
          buffer.json += string;
          break;
        case 'number':
        case 'primitive':
          if (Tokens.followsSymbol(buffer.tokens_merge, i, ['{'])) {
            buffer.tokens_merge[i].type = 'key';
            type = buffer.tokens_merge[i].type;
            string = `"${string}"`;
          } else if (Tokens.typeFollowed(buffer.tokens_merge, i) === 'key') {
            buffer.tokens_merge[i].type = 'key';
            type = buffer.tokens_merge[i].type;
          } else if (!Tokens.followsSymbol(buffer.tokens_merge, i, ['[', ':', ','])) {
            setError(i, format(lang.invalidToken.tokenSequence.permitted, {
              firstToken: type,
              secondToken: ['[', ':', ',']
            }));
            break;
          }
          if (type !== 'key' && !buffer2.isValue) {
            buffer.tokens_merge[i].type = 'key';
            type = buffer.tokens_merge[i].type;
            string = `"${string}"`;
          }
          if (type === 'primitive' && string === 'undefined') {
            setError(i, format(lang.invalidToken.useInstead, {
              badToken: 'undefined',
              goodToken: 'null'
            }));
          }
          buffer.json += string;
          break;
        // no default
      }
    }

    let noEscapedSingleQuote = '';
    for (let i = 0; i < buffer.json.length; i++) {
      const current = buffer.json.charAt(i);
      const next = buffer.json.charAt(i+1) || '';
      if (i + 1 < buffer.json.length) {
        if (current === '\\' && next === "'") {
          noEscapedSingleQuote += next;
          i += 1;
          // eslint-disable-next-line no-continue
          continue;
        }
      }
      noEscapedSingleQuote += current;
    }

    buffer.json = noEscapedSingleQuote;
    if (errorMsg === undefined) {
      const maxIterations = Math.ceil(bracketList.length / 2);
      let round = 0;
      let delta = false;

      const removePair = (index: number) => {
        bracketList.splice(index+1, 1);
        bracketList.splice(index, 1);
        if (!delta) {
          delta = true;
        }
      };

      while (bracketList.length > 0) {
        delta = false;
        for (let tokenCount = 0; tokenCount < bracketList.length-1; tokenCount++) {
          const pair = bracketList[tokenCount].string + bracketList[tokenCount+1].string;
          if (['[]', '{}'].includes(pair)) {
            removePair(tokenCount);
          }
        }
        round += 1;
        if (!delta || round >= maxIterations) {
          break;
        }
      }

      if (bracketList.length > 0) {
        const bracketString = bracketList[0].string;
        const bracketPosition = bracketList[0].i;
        const closingBracketType = bracketString === '[' ? ']' : '}';
        line = bracketList[0].line;
        setError(bracketPosition, format(lang.brace[closingBracketType === ']' ? 'square' : 'curly'].missingClose));
      }
    }

    if (errorMsg === undefined) {
      if (![undefined, ''].includes(buffer.json)) {
        try {
          buffer.jsObject = JSON.parse(buffer.json) as Record<string, any>;
        } catch (err) {
          const errorMessage = (err as Error).message;
          const subsMark = errorMessage.indexOf('position');
          if (subsMark === -1) {
            throw new Error('Error parsing failed');
          }

          const errPositionStr = errorMessage.substring(subsMark + 9, errorMessage.length);
          const errPosition = parseInt(errPositionStr, 10);
          let charTotal = 0;
          let tokenIndex = 0;
          let token: Tokens.MergeToken = buffer.tokens_merge[tokenIndex];
          let lineCount = 1;
          let exitWhile = false;

          while (charTotal < errPosition && !exitWhile) {
            token = buffer.tokens_merge[tokenIndex];
            if (token.type === 'linebreak') {
              lineCount += 1;
            }
            if (!['space', 'linebreak'].includes(token.type)) {
              charTotal += token.string.length;
            }
            if (charTotal >= errPosition) {
              break;
            }
            tokenIndex += 1;
            if (!buffer.tokens_merge[tokenIndex+1]) {
              exitWhile = true;
            }
          }

          line = lineCount;
          let backslashCount = 0;
          for (let i = 0; i < token.string.length; i++) {
            const char = token.string.charAt(i);
            if (char === '\\') {
              backslashCount = backslashCount > 0 ? backslashCount + 1 : 1;
            } else {
              if (backslashCount % 2 !== 0 || backslashCount === 0) {
                if (!'\'"bfnrt'.includes(char)) {
                  setError(tokenIndex, format(lang.invalidToken.unexpected, {
                    token: '\\'
                  }));
                }
              }
              backslashCount = 0;
            }
          }
          if (errorMsg === undefined) {
            setError(tokenIndex, format(lang.invalidToken.unexpected, {
              token: token.string
            }));
          }
        }
      }
    }

    let lines = 1;
    let depth = 0;
    const newIndent = () => Array(depth * 2).fill('&nbsp;').join('');
    const newLineBreak = (byPass = false) => {
      lines += 1;
      return (depth > 0 || byPass) ? '</div><div>' : '';
    };
    const newLineBreakAndIndent = (byPass = false) => `${newLineBreak(byPass)}${newIndent()}`;

    if (errorMsg === undefined) {
      const lastMergeIdx = buffer.tokens_merge.length - 1;
      buffer.markup += '<div>';

      // Format by Token
      buffer.tokens_merge.forEach((token, i) => {
        const { string, type } = token;
        const islastToken = i === lastMergeIdx;

        switch (type) {
          case 'string':
          case 'number':
          case 'primitive':
          case 'error':
            // buffer.markup += Tokens.followsSymbol(buffer.tokens_merge, i, [',', '[']) ? newLineBreakAndIndent() : '';
            buffer.markup += this.newSpan(i, token, depth);
            break;
          case 'key':
            buffer.markup += `${newLineBreakAndIndent()}${this.newSpan(i, token, depth)}`;
            break;
          case 'colon':
            buffer.markup += `${this.newSpan(i, token, depth)}&nbsp;`;
            break;
          case 'symbol':
            switch (string) {
              case '{':
                buffer.markup += this.newSpan(i, token, depth);
                depth += 1;
                break;
              case '}':
                depth = depth > 0 ? depth - 1 : depth;
                const adjust = i > 0 ? (Tokens.followsSymbol(buffer.tokens_merge, i, ['[', '{']) ? '' : newLineBreakAndIndent(islastToken)) : '';
                buffer.markup += `${adjust}${this.newSpan(i, token, depth)}`;
                break;
              case '[':
                if (Tokens.followsSymbol(buffer.tokens_merge, i, ['['])) {
                  depth += 1;
                  buffer.markup += newLineBreakAndIndent();
                }
                buffer.markup += this.newSpan(i, token, depth);
                break;
              case ']':
                let indBool = false;
                if (Tokens.followsSymbol(buffer.tokens_merge, i, [']'])) {
                  if (Tokens.followedBySymbol(buffer.tokens_merge, i, [']'])) {
                    if (Tokens.followedBySymbol(buffer.tokens_merge, i+1, [','])) {
                      depth = depth >= 1 ? depth - 1 : depth;
                      indBool = true;
                      i += 1;
                    } else if (Tokens.followedBySymbol(buffer.tokens_merge, i+1, [']'])) {
                      depth = depth >= 1 ? depth - 1 : depth;
                      indBool = true;
                    }
                  } else if (Tokens.followedBySymbol(buffer.tokens_merge, i, ['}'])) {
                    depth = depth >= 1 ? depth - 1 : depth;
                    indBool = true;
                  }
                }
                buffer.markup += `${indBool ? newLineBreakAndIndent() : ''}${this.newSpan(i, token, depth)}`;
                break;
              case ',':
                buffer.markup += this.newSpan(i, token, depth);
                if (Tokens.followsSymbol(buffer.tokens_merge, i, [']']) && Tokens.followedBySymbol(buffer.tokens_merge, i, ['['])) {
                  buffer.markup += newLineBreakAndIndent();
                }
                break;
              default:
                buffer.markup += this.newSpan(i, token, depth);
                break;
            }
            break;
          // no default
        }
      });
      buffer.markup += '</div>';
      // TODO: update line count logic
      // lnes += (markup.match(/<\/div><div>/g) || []).length
    }

    if (errorMsg !== undefined) {
      let lineFallback = 1;
      lines = 1;
      buffer.markup += '<div>';

      buffer.tokens_merge.forEach((token, i) => {
        const { string, type } = token;
        if (type === 'linebreak') {
          lines += 1;
          buffer.markup += '</div><div>';
        } else {
          buffer.markup += this.newSpan(i, token, depth);
        }
        lineFallback += countCarrigeReturn(string);
      });

      buffer.markup += '</div>';
      lines += 1;
      // TODO: update line count logic
      // lnes += (markup.match(/<\/div><div>/g) || []).length
      lineFallback += 1;
      if (lines < lineFallback) {
        lines = lineFallback;
      }
    }

    buffer.tokens_merge.forEach(token => {
      const { string, type } = token;
      buffer.indented += string;
      if (!['space', 'linebreak'].includes(type)) {
        buffer.tokens_plainText += string;
      }
    });

    if (errorMsg !== undefined) {
      const { modifyErrorText } = this.props;
      if (modifyErrorText && isFunction(modifyErrorText)) {
        errorMsg.reason = modifyErrorText(errorMsg.reason);
      }
    }

    return {
      tokens: buffer.tokens_merge,
      noSpaces: buffer.tokens_plainText,
      indented: buffer.indented,
      json: buffer.json,
      jsObject: buffer.jsObject,
      markup: buffer.markup,
      lines,
      error: errorMsg
    };
  }

  tokenizePlaceholder(obj: Record<string, any>): null|Placeholder.PlaceholderTokenize {
    const buffer: Placeholder.PrimaryBuffer = {
      inputText: JSON.stringify(obj),
      position: 0,
      currentChar: '',
      tokenPrimary: '',
      tokenSecondary: '',
      brackets: [],
      isValue: false,
      stringOpen: null,
      stringStart: 0,
      tokens: []
    };

    buffer.inputText.split('').forEach((char, i) => {
      buffer.position = i;
      buffer.currentChar = char;
      const a = Placeholder.determineValue(buffer);
      const b = Placeholder.determineString(buffer);
      const c = Placeholder.escapeCharacter(buffer);
      if (!a && !b && !c) {
        if (!buffer.stringOpen) {
          buffer.tokenSecondary += buffer.currentChar;
        }
      }
    });

    const buffer2: Placeholder.SecondaryBuffer = {
      brackets: [],
      isValue: false,
      tokens: []
    };

    buffer2.tokens = buffer.tokens.map<Tokens.MarkupToken>(token => {
      const rtnToken: Tokens.MarkupToken = {
        depth: 0,
        string: '',
        type: 'undefined',
        value: ''
      };

      switch (token) {
        case ',':
          rtnToken.type = 'symbol';
          rtnToken.string = token;
          rtnToken.value = token;
          buffer2.isValue = buffer2.brackets[buffer2.brackets.length-1] === '[';
          break;
        case ':':
          rtnToken.type = 'symbol';
          rtnToken.string = token;
          rtnToken.value = token;
          buffer2.isValue = true;
          break;
        case '{':
        case '[' :
          rtnToken.type = 'symbol';
          rtnToken.string = token;
          rtnToken.value = token;
          buffer2.brackets.push(token);
          buffer2.isValue = buffer2.brackets[buffer2.brackets.length-1] === '[';
          break;
        case '}':
        case ']':
          rtnToken.type = 'symbol';
          rtnToken.string = token;
          rtnToken.value = token;
          buffer2.brackets.pop();
          buffer2.isValue = buffer2.brackets[buffer2.brackets.length-1] === '[';
          break;
        case 'undefined':
          rtnToken.type = 'primitive';
          rtnToken.string = token;
          rtnToken.value = undefined;
          break;
        case 'null':
          rtnToken.type = 'primitive';
          rtnToken.string = token;
          rtnToken.value = null;
          break;
        case 'false':
          rtnToken.type = 'primitive';
          rtnToken.string = token;
          rtnToken.value = false;
          break;
        case 'true':
          rtnToken.type = 'primitive';
          rtnToken.string = token;
          rtnToken.value = true;
          break;
        default:
          if ('\'"'.includes(token.charAt(0))) {
            rtnToken.type = buffer2.isValue ? 'string' : 'key';
            if (rtnToken.type === 'key') {
              rtnToken.string = Placeholder.stripQuotesFromKey(token);
            }
            if (rtnToken.type === 'string') {
              rtnToken.string = '';
              const charList2 = token.slice(1, -1).split('');
              for (let ii = 0; ii < charList2.length; ii++) {
                const char = charList2[ii];
                rtnToken.string += '\'"'.includes(char) ? `\\${char}` : char;
              }
              rtnToken.string = `'${rtnToken.string}'`;
            }
            rtnToken.value = rtnToken.string;
          } else if (!Number.isNaN(Number(token))) {
            rtnToken.type = 'number';
            rtnToken.string = token;
            rtnToken.value = Number(token);
          } else if (token.length > 0 && !buffer2.isValue) {
            rtnToken.type = 'key';
            rtnToken.string = token.includes(' ') ? `'${token}'` : token;
            rtnToken.value = rtnToken.string;
          }
      }
      rtnToken.depth = buffer2.brackets.length;
      return rtnToken;
    });

    const clean = buffer2.tokens.map(t => t.string).join('');
    const lastIndex = buffer2.tokens.length - 1;
    let indentation = '';
    let lines = 1;
    let markup = '<div>';

    const indent = (num: number, byPass=false) => `${(num > 0 || byPass) ? '\n' : ''}${Array(num * 2).fill(' ').join('')}`;
    const indentII = (num: number, byPass=false) => {
      lines += num > 0 ? 1 : 0;
      return `${(num > 0 || byPass) ? '</div><div>' : ''}${Array(num * 2).fill('&nbsp;').join('')}`;
    };

    // Format by Token
    let depth = 0;
    buffer2.tokens.forEach((token, i) => {
      const { string, type } = token;
			const islastToken = i === lastIndex;

      switch (type) {
        case 'string':
        case 'number':
          indentation += string;
          markup += this.newSpan(i, token, depth);
          break;
        case 'key':
          indentation += `${indent(depth)}${string}`;
          markup += `${indentII(depth)}${this.newSpan(i, token, depth)}`;
          break;
        case 'symbol':
          switch (token.string) {
            case '{':
              indentation += string;
              markup += this.newSpan(i, token, depth);
              depth += 1;
              if (Tokens.followedBySymbol(buffer2.tokens, i, ['}'])) {
                indentation += indent(depth);
                markup += indentII(depth);
              }
              break;
            case '}':
              depth = depth >= 1 ? depth - 1 : depth;
              const adjust = i > 0 ? (Tokens.followsSymbol(buffer2.tokens, i, ['[', '{']) ? '' : indent(depth, islastToken)) : '';
              const adjustII = i > 0 ? (Tokens.followsSymbol(buffer2.tokens, i, ['[', '{']) ? '' : indentII(depth, islastToken)) : '';
              indentation += `${adjust}${string}`;
              markup += `${adjustII}${this.newSpan(i, token, depth)}`;
              break;
            case '[':
              if (Tokens.followsSymbol(buffer2.tokens, i, ['['])) {
                depth += 1;
                indentation += indent(depth);
                markup += indentII(depth);
              }
              indentation += token.string;
              markup += this.newSpan(i, token, depth);
              break;
            case ']':
              let indBool = false;
              if (Tokens.followsSymbol(buffer2.tokens, i, [']'])) {
                if (Tokens.followedBySymbol(buffer2.tokens, i, [']'])) {
                  if (Tokens.followedBySymbol(buffer2.tokens, i+1, [','])) {
                    depth = depth >= 1 ? depth - 1 : depth;
                    indBool = true;
                    i += 1;
                  } else if (Tokens.followedBySymbol(buffer2.tokens, i+1, [']'])) {
                    depth = depth >= 1 ? depth - 1 : depth;
                    indBool = true;
                  }
                } else if (Tokens.followedBySymbol(buffer2.tokens, i, ['}'])) {
                  depth = depth >= 1 ? depth - 1 : depth;
                  indBool = true;
                }
              }
              indentation += `${indBool ? indent(depth) : ''}${string}`;
              markup += `${indBool ? indentII(depth) : ''}${this.newSpan(i, token, depth)}`;
              break;
            case ':':
              indentation += `${token.string} `;
              markup += `${this.newSpan(i, token, depth)}&nbsp;`;
              break;
            case ',':
              indentation += token.string;
              markup += this.newSpan(i, token, depth);
              if (Tokens.followsSymbol(buffer2.tokens, i, [']']) && Tokens.followedBySymbol(buffer2.tokens, i, ['['])) {
                indentation += indent(depth);
                markup += indentII(depth);
              }
              break;
            default:
              indentation += token.string;
              markup += this.newSpan(i, token, depth);
              break;
          }
          break;
        // no default
      }
    });
    lines += 2;
    // TODO: update line count logic
    // lnes += (markup.match(/<\/div><div>/g) || []).length
    markup += '</div>';

    return {
      tokens: buffer2.tokens,
      noSpaces: clean,
      indented: indentation,
      json: JSON.stringify(obj),
      jsObject: obj,
      markup,
      lines
    };
  }
}

export default JADNInput;