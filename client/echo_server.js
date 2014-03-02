 var getUTF8Size = function( str ) {
        var sizeInBytes = str.split('')
          .map(function( ch ) {
            return ch.charCodeAt(0);
          }).map(function( uchar ) {
            // The reason for this is explained later in
            // the section “An Aside on Text Encodings”
            return uchar < 128 ? 1 : 2;
          }).reduce(function( curr, next ) {
            return curr + next;
          });
       
        return sizeInBytes;
      };

      var sock = new SockJS('http://localhost:9999/echo');
      sock.onopen = function () {
        console.log('open');

        //sock.send("Hello, World!");

        var arr = [
          0,
          15.290663048624992,
          2.0000000004989023,
          -24.90756910131313,
          0.32514392007855847,
          -0.8798439564294107,
          0.32514392007855847,
          0.12015604357058937,
          1,
          7.490254936274141,
          2.0000000004989023,
          -14.188117316225544,
          0,
          0.018308020720336753,
          0.1830802072033675,
          0.9829274917854702
        ];
        console.log(getUTF8Size(JSON.stringify(arr)));
        //sock.send(JSON.stringify(arr));

        var data = new Float64Array([
          0,
          15.290663048624992,
          2.0000000004989023,
          -24.90756910131313,
          0.32514392007855847,
          -0.8798439564294107,
          0.32514392007855847,
          0.12015604357058937,
          1,
          7.490254936274141,
          2.0000000004989023,
          -14.188117316225544,
          0,
          0.018308020720336753,
          0.1830802072033675,
          0.9829274917854702
        ]);
        var charView = new Uint8Array(data.buffer);
        var slimmerMsg = String.fromCharCode.apply(
          String, [].slice.call( charView, 0 )
        );
        console.log(slimmerMsg);
        console.log(getUTF8Size(slimmerMsg));
        sock.send(slimmerMsg);
      };
      sock.onmessage = function (e) {
        console.log('message', e.data);
      };
      sock.onclose = function () {
        console.log('close');
      };

