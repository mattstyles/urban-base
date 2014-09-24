
var expect = chai.expect;


describe( 'Events', function() {

    var base = null;

    function noop() {};

    beforeEach( function() {
        test.createBase();
        base = document.querySelector( 'urban-base' );
    });

    afterEach( function() {
        test.removeBase();
        base = null;
    });

    it( 'expects a private listeners array to exist', function() {
        expect( base._listeners.length ).to.equal( 0 );
    });

    describe( '.on - assignment', function() {

        beforeEach( function() {
            base.on( 'testEvent', noop );
        });

        it( 'expects a listener to be added when called', function() {
            expect( base._listeners.length ).to.equal( 1 );
        });

        it( 'expects an item in the listener array to reference the event, the callback and the wrapped callback', function() {
            var listener = base._listeners[ 0 ];
            expect( listener ).to.have.keys( [ 'event', 'listener', 'handler' ] );
        });

        it( 'expects the listener to be added to the listeners array', function() {
            expect( base._listeners[ 0 ].listener ).to.equal( noop );
        });

        it( 'expects multiple listeners to be assigned to an event', function() {
            base.on( 'testEvent', function() {} );
            base.on( 'anotherEvent', function() {} );

            expect( base._listeners.length ).to.equal( 3 );
            expect( _.filter( base._listeners, { event: 'testEvent' } ).length ).to.equal( 2 );
        });
    });

    describe( '.on - execution', function() {
        var fn = null;

        beforeEach( function() {
            fn = sinon.spy();
            base.on( 'testEvent', fn );
            base.on( 'testArgs', { foo: 'foo' }, fn );
        });

        afterEach( function() {
            fn = null;
        });

        it( 'expects that a bound listener will be fired', function() {
            base.fire( 'testEvent' );

            expect( fn ).to.have.been.called;
        });
    });

    describe( '.on - context', function() {
        var ctx = null;

        beforeEach( function() {
            ctx = {};
        });

        afterEach( function() {
            ctx = null;
        });

        it( 'expects the handler to be fired within the context of the element', function( done ) {
            base.on( 'testEvent', function( event ) {
                this.addedProp = 'prop';
                base.fire( 'onComplete' );
            });
            base.on( 'onComplete', function() {
                expect( base.addedProp ).to.equal( 'prop' );
                done();
            });
            base.fire( 'testEvent' );
        });

        it( 'expects that the context of the handler can be specified', function( done ) {
            base.on( 'testEvent', function( event ) {
                this.addedProp = 'prop';
                base.fire( 'onComplete' );
            }, ctx );
            base.on( 'onComplete', function() {
                expect( ctx.addedProp ).to.equal( 'prop' );
                expect( base.addedProp ).to.not.exist;
                done();
            });
            base.fire( 'testEvent' );
        });
    });

    describe( '.on - passing data', function() {
        var args = {
            foo: 'foo',
            bar: 'bar'
        };

        var fakeArgs = {
            foo: 'foobar'
        };

        var extraArgs = {
            baz: 'baz',
            quux: 'quux'
        };

        var stringArg = 'foobarbaz';

        it( 'expects that a listener can apply arguments to a handler', function( done ) {
            base.on( 'testEvent', args, function( event ) {
                expect( event.detail ).to.deep.equal( args );
                done();
            });
            base.fire( 'testEvent' );
        });

        it( 'expects that an emitter can apply arguments to a handler', function( done ) {
            base.on( 'testEvent', function( event ) {
                expect( event.detail ).to.deep.equal( args );
                done();
            });
            base.fire( 'testEvent', args );
        });

        it( 'expects that emitted arguments take precedence over listener arguments', function( done ) {
            base.on( 'testEvent', fakeArgs, function( event ) {
                expect( event.detail.foo ).to.equal( 'foo' );
                done();
            });
            base.fire( 'testEvent', args );
        });

        it( 'expects that arguments can be added by both the listener and the emitter', function( done ) {
            base.on( 'testEvent', extraArgs, function( event ) {
                expect( event.detail ).to.have.keys( [ 'foo', 'bar', 'baz', 'quux' ] );
                done();
            });
            base.fire( 'testEvent', args );
        });

        it( 'expects that a string can be passed as an arg', function( done ) {
            base.on( 'testEvent', stringArg, function( event ) {
                expect( event.detail.data ).to.equal( stringArg );
                done();
            });
            base.fire( 'testEvent' );
        });
    });

    describe( '.off', function() {
        var fn = function() {};

        beforeEach( function () {
            base.on( 'testEvent', noop );
        });

        it( 'expects that calling off will remove an event from the list', function() {
            expect( base._listeners.length ).to.equal( 1 );
            base.off( 'testEvent', noop );

            expect( base._listeners.length ).to.equal( 0 );
        });

        it( 'expects that a specific handler can be removed an event type', function() {
            base.on( 'testEvent', fn );
            expect( base._listeners.length ).to.equal( 2 );

            base.off( 'testEvent', noop );
            expect( base._listeners.length ).to.equal( 1 );
            expect( base._listeners[ 0 ].listener ).to.equal( fn );
        });

        it( 'expects that a function can be assigned to multiple events and removed individually', function() {
            base.on( 'anotherEvent', noop );

            base.off( 'testEvent', noop );
            expect( base._listeners[ 0 ].listener ).to.equal( noop );
            expect( base._listeners[ 0 ].event ).to.equal( 'anotherEvent' );
            expect( _.filter( base._listeners, { event: 'testEvent' } ).length ).to.equal( 0 );
        });
    });

    describe( '.off - all off', function() {
        var fn = function() {};

        beforeEach( function () {
            base.on( 'testEvent', noop );
            base.on( 'testEvent', fn );
        });

        it( 'expects that turning off an event removes all bound handlers', function() {
            base.off( 'testEvent' );

            expect( base._listeners.length ).to.equal( 0 );
        });
    });


    describe( '.once', function() {
        var fn = null;

        beforeEach( function() {
            fn = sinon.spy();
            base.once( 'testEvent', fn );
        });

        afterEach( function() {
            fn = null;
        });

        it( 'expects the handler to be called only once', function() {
            base.fire( 'testEvent' );
            expect( fn ).to.have.been.called;

            base.fire( 'testEvent' );
            expect( fn ).to.have.been.calledOnce;
        });
    })
});
