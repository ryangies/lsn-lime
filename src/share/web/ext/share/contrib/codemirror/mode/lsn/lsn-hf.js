CodeMirror.defineMode("lsn-hf", function(config) {

  return {

    token: function(stream, state) {

      // Newline reached, close inline assignments
      if (stream.sol()) {
        state.rval = false;
      }

      // Ignore space at the beginning of the line and between tokens
      stream.eatSpace();

      var ch1 = stream.next(); // current character
      var ch2 = ch1 + stream.peek(); // current to characters
      var str = stream.string.slice(stream.pos - 1); // current string (to eol)

      // End block comment ends
      if (str == '#}') {
        state.stack.pop();
        state.comment = false;
        stream.skipToEnd();
        return 'comment';
      }

      // End block comment begins
      if (str == '#{') {
        state.stack.push(str);
        state.comment = true;
        stream.skipToEnd();
        return 'comment';
      }

      // Single-line comment
      if ((ch1 == '#' && !(state.rval || state.isText())) || state.comment) {
        stream.skipToEnd();
        return 'comment';
      }

      // Escaped character
      if (ch1 == '\\') {
        stream.pos++;
        return 'builtin';
      }

      // Closer
      if (str == state.closer) {
        state.stack.pop();
        state.closer = '}';
        state.literal = false;
        stream.skipToEnd();
        return 'tag';
      }

      // Within a text block (which hasn't closed)
      if (state.literal) {
        stream.skipToEnd();
        return 'string';
      }

      // Ends a key/value pair
      if (ch2 && ch2.match(/[%@]{/)) {
        state.stack.push(ch2);
        stream.pos++;
        return 'tag';
      }

      // Literal via ${
      if (ch2 && ch2 == '${') {
        state.literal = true;
        state.stack.push(ch2);
        stream.pos++;
        return 'tag';
      }
      
      // Literal via <<_eol
      if (ch2 && ch2 == '<<') {
        state.closer = str.substr(2);
        state.literal = true;
        state.stack.push(ch2);
        stream.skipToEnd();
        return 'tag';
      }

      // Inline value assignment
      if (state.rval) {
        state.rval = false;
        stream.skipToEnd();
        return 'string';
      }

      // Separates a key/value pair
      if (ch2 && ch2 == '=>') {
        state.rval = true;
        stream.pos++;
        return 'operator';
      }

      // Begins a key/value pair
      // key =>
      var i = str.indexOf('=>');
      if (i > -1) {
        stream.pos += Math.max(0, i - 1);
        return 'atom';
      }

      // Either we're an array item or in undefined space
      return state.isArray() ? 'string' : null;

    },

    startState: function(base) {
      function State () {
        this.stack = [];
        this.rval = false;
        this.literal = false;
        this.comment = false;
        this.closer = '}';
      }
      State.prototype = {
        getTag: function () {
          var i = this.stack.length - 1;
          var tag = i > -1 ? this.stack[i] : null;
          return tag;
        },
        isComment: function () {
          return this.getTag() == '#{';
        },
        isArray: function () {
          return this.getTag() == '@{';
        },
        isText: function () {
          return this.getTag() == '${' || this.getTag() == '<<';
        },
        isHash: function () {
          return this.getTag() == '%{';
        }
      };
      return new State();
    },

    indent: function(state, textAfter) {
      var n = state.stack.length;
      if (/^[#]\}/.test(textAfter) && state.getTag() != '<<') n--;
      return n * config.indentUnit;
    },

    electricChars: "}"

  };

});
